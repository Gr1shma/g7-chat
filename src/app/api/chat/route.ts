import {
    type LanguageModelV1,
    type Message,
    createDataStreamResponse,
    generateText,
    smoothStream,
    streamText,
} from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

import { auth } from "~/server/auth";
import {
    getMostRecentUserMessage,
    sanitizeResponseMessages,
} from "~/lib/utils";
import { appRouter } from "~/server/api/root";
import { db } from "~/server/db";
import { messages_table, threads_table } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import {
    getModelConfigByKey,
    type ModelConfig,
    type ValidModelWithProvider,
    MODEL_CONFIGS,
} from "~/lib/ai/models";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { env } from "~/env";
import {
    canGuestSendMessage,
    incrementGuestUsage,
    getRemainingMessages,
} from "~/server/api/guest-rate-limit";

export const maxDuration = 60;

function jsonResponse(data: object, status: number): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

interface ValidatedRequest {
    modelConfig: ModelConfig;
    apiKey: string;
    usingServerKey: boolean;
}

async function validateRequest(
    model: string | undefined,
    headersList: Headers | undefined,
    isGuest: boolean
): Promise<ValidatedRequest | Response> {
    const effectiveModel = model ?? "groq:llama-3.1-8b-instant";
    const modelConfig = getModelConfigByKey(
        effectiveModel as ValidModelWithProvider
    );

    if (!modelConfig) {
        return jsonResponse({ error: "Invalid model specified" }, 400);
    }

    if (!headersList) {
        return jsonResponse({ error: "Headers missing" }, 400);
    }

    const userApiKey = headersList.get(modelConfig.headerKey);

    if (userApiKey && userApiKey.trim().length > 0) {
        return { modelConfig, apiKey: userApiKey, usingServerKey: false };
    }

    if (isGuest && env.GROQ_API_KEY) {
        const groqModelConfig = MODEL_CONFIGS.groq[0]!;
        return {
            modelConfig: groqModelConfig,
            apiKey: env.GROQ_API_KEY,
            usingServerKey: true,
        };
    }

    return jsonResponse(
        { error: `API key missing for provider ${modelConfig.provider}` },
        401
    );
}

function createAIModel(
    modelConfig: ModelConfig,
    apiKey: string
): LanguageModelV1 | Response {
    switch (modelConfig.provider) {
        case "google": {
            const google = createGoogleGenerativeAI({ apiKey });
            return google(modelConfig.modelId);
        }
        case "openai": {
            const openai = createOpenAI({ apiKey });
            return openai(modelConfig.modelId) as LanguageModelV1;
        }
        case "openrouter": {
            const openrouter = createOpenRouter({ apiKey });
            return openrouter(modelConfig.modelId) as LanguageModelV1;
        }
        case "groq": {
            const groqrouter = createGroq({ apiKey });
            return groqrouter(modelConfig.modelId) as LanguageModelV1;
        }
        default:
            return jsonResponse({ error: "Unsupported model provider" }, 400);
    }
}

export async function POST(request: Request) {
    const { id, messages, model } = (await request.json()) as {
        id: string;
        messages: Array<Message>;
        model?: string;
    };

    const session = await auth();

    if (!session || !session.user || !session.user.id) {
        return new Response("Unauthorized", { status: 401 });
    }

    const isGuest = session.user.isGuest ?? false;

    const userMessage = getMostRecentUserMessage(messages);

    if (!userMessage) {
        return new Response("No user message found", { status: 400 });
    }

    const headersList = await headers();

    const validationResult = await validateRequest(model, headersList, isGuest);

    if (validationResult instanceof Response) {
        return validationResult;
    }

    const { modelConfig, apiKey, usingServerKey } = validationResult;

    if (isGuest && usingServerKey) {
        if (!canGuestSendMessage(session.user.id)) {
            const remaining = getRemainingMessages(session.user.id);
            return jsonResponse(
                {
                    error: `Daily message limit reached (${env.GUEST_MESSAGE_LIMIT} messages/day). Add your own API key or sign in to continue.`,
                    remainingMessages: remaining,
                    limitReached: true,
                },
                429
            );
        }
        incrementGuestUsage(session.user.id);
    }

    const aiModelOrResponse = createAIModel(modelConfig, apiKey);

    if (aiModelOrResponse instanceof Response) {
        return aiModelOrResponse;
    }

    const aiModel = aiModelOrResponse;

    const caller = appRouter.createCaller({
        session,
        db: db,
        headers: request.headers,
    });

    if (messages.length === 1) {
        const titleModel = env.GROQ_API_KEY
            ? (createGroq({ apiKey: env.GROQ_API_KEY })(
                  "llama-3.1-8b-instant"
              ) as LanguageModelV1)
            : aiModel;

        const { text: title } = await generateText({
            model: titleModel,
            system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 15 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
            prompt: JSON.stringify(userMessage),
        });

        await caller.thread.saveThread({
            projectId: null,
            threadId: id,
            title,
        });
    }

    await db.insert(messages_table).values([
        {
            ...userMessage,
            createdAt: new Date(),
            threadId: id,
        },
    ]);

    const regularPrompt = (() => {
        const customization = session.user.customization;
        let prompt =
            "You are a friendly assistant! Keep your responses concise and helpful.";
        if (!customization) return prompt;
        const { name, whatDoYouDo, chatTraits, keepInMind } = customization;
        if (name.trim()) {
            prompt += `The user's name is ${name}.`;
        }
        if (whatDoYouDo.trim()) {
            prompt += `The user is a ${whatDoYouDo}. Tailor your responses to be relevant, professional, and considerate of this background.`;
        }
        if (chatTraits.trim()) {
            prompt += `The user prefers these conversational traits: ${chatTraits}.`;
        }
        if (keepInMind.trim()) {
            prompt += `Keep in mind: ${keepInMind}.`;
        }
        return prompt;
    })();

    return createDataStreamResponse({
        execute: (dataStream) => {
            const result = streamText({
                system: regularPrompt,
                model: aiModel,
                messages,
                maxSteps: 5,
                experimental_transform: smoothStream({ chunking: "word" }),
                experimental_generateMessageId: () => crypto.randomUUID(),
                onFinish: async ({ response }) => {
                    if (session.user?.id) {
                        try {
                            const sanitizedResponseMessages =
                                sanitizeResponseMessages({
                                    messages: response.messages,
                                });

                            await db
                                .update(threads_table)
                                .set({
                                    updatedAt: new Date(),
                                })
                                .where(
                                    and(
                                        eq(threads_table.id, id),
                                        eq(
                                            threads_table.userId,
                                            session.user.id
                                        )
                                    )
                                );

                            await db.insert(messages_table).values(
                                sanitizedResponseMessages.map((message) => {
                                    return {
                                        id: message.id,
                                        threadId: id,
                                        role: message.role,
                                        content: message.content,
                                        createdAt: new Date(),
                                    };
                                })
                            );
                        } catch (error) {
                            throw error;
                        }
                    }
                },
                experimental_telemetry: {
                    isEnabled: true,
                    functionId: "stream-text",
                },
            });

            result.mergeIntoDataStream(dataStream, {
                sendReasoning: true,
            });
        },
        onError: (error: unknown) => {
            if (error instanceof Error) {
                const message = error.message.toLowerCase();

                if (
                    message.includes("api key") ||
                    message.includes("unauthorized") ||
                    message.includes("401")
                ) {
                    return "Invalid or expired API key. Please check your API key settings.";
                }
                if (message.includes("rate limit") || message.includes("429")) {
                    return "Rate limit exceeded. Please wait a moment and try again.";
                }
                if (message.includes("quota") || message.includes("billing")) {
                    return "API quota exceeded. Please check your billing settings.";
                }
                if (
                    message.includes("network") ||
                    message.includes("fetch") ||
                    message.includes("timeout")
                ) {
                    return "Network error. Please check your internet connection and try again.";
                }
                if (
                    message.includes("model") ||
                    message.includes("not found")
                ) {
                    return "The selected model is not available. Please try a different model.";
                }

                return error.message;
            }

            return "Oops, an error occurred! Please try again.";
        },
    });
}

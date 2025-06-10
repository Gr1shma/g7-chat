import {
    type LanguageModelV1,
    type Message,
    createDataStreamResponse,
    smoothStream,
    streamText,
} from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

import { generateTitleFromUserMessage } from "~/app/(thread)/actions";
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
import { type AIModel, getModelConfig } from "~/lib/ai/models";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq, groq } from "@ai-sdk/groq";

export const maxDuration = 60;

export async function POST(request: Request) {
    const {
        id,
        messages,
        model,
    }: { id: string; messages: Array<Message>; model?: string } =
        await request.json();

    const session = await auth();

    if (!session || !session.user || !session.user.id) {
        return new Response("Unauthorized", { status: 401 });
    }

    const userMessage = getMostRecentUserMessage(messages);

    if (!userMessage) {
        return new Response("No user message found", { status: 400 });
    }

    const headersList = await headers();

    const modelConfig = getModelConfig(model as AIModel);

    const apiKey = headersList.get(modelConfig.headerKey)!;

    let aiModel: LanguageModelV1;
    switch (modelConfig.provider) {
        case "google":
            const google = createGoogleGenerativeAI({ apiKey });
            aiModel = google(modelConfig.modelId);
            break;

        case "openai":
            const openai = createOpenAI({ apiKey });
            aiModel = openai(modelConfig.modelId) as LanguageModelV1;
            break;

        case "openrouter":
            const openrouter = createOpenRouter({ apiKey });
            aiModel = openrouter(modelConfig.modelId) as LanguageModelV1;
            break;
        case "groq":
            const groqrouter = createGroq({ apiKey });
            aiModel = groqrouter(modelConfig.modelId) as LanguageModelV1;
            break;
        default:
            return new Response(
                JSON.stringify({ error: "Unsupported model provider" }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            );
    }

    const caller = appRouter.createCaller({
        session,
        db: db,
        headers: request.headers,
    });

    if (messages.length === 1) {
        const title = await generateTitleFromUserMessage({
            message: userMessage,
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
            prompt += ` The user's name is ${name}.`;
        }
        if (whatDoYouDo.trim()) {
            prompt += ` The user is a ${whatDoYouDo}. Tailor your responses to be relevant, professional, and considerate of this background.`;
        }
        if (chatTraits.trim()) {
            prompt += ` The user prefers these conversational traits: ${chatTraits}.`;
        }
        if (keepInMind.trim()) {
            prompt += ` Keep in mind: ${keepInMind}.`;
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
                experimental_generateMessageId: crypto.randomUUID,
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
        onError: () => {
            return "Oops, an error occured!";
        },
    });
}

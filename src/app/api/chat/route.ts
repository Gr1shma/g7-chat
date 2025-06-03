import {
    type Message,
    createDataStreamResponse,
    smoothStream,
    streamText,
} from "ai";

import { generateTitleFromUserMessage } from "~/app/(thread)/actions";
import { auth } from "~/server/auth";
import {
    getMostRecentUserMessage,
    sanitizeResponseMessages,
} from "~/lib/utils";
import {
    AIProviderSafe,
    getDefaultModel,
} from "~/lib/ai/providers";
import { appRouter } from "~/server/api/root";
import { db } from "~/server/db";
import { messages_table, threads_table } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";

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

    let selectedModel;

    if (model) {
        selectedModel = AIProviderSafe(model);
        if (!selectedModel) {
            console.warn(
                `Invalid model specified: ${model}, falling back to default`
            );
            selectedModel = getDefaultModel();
        }
    } else {
        selectedModel = getDefaultModel();
    }

    const caller = appRouter.createCaller({
        session,
        db: db,
        headers: request.headers,
    });

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
                model: selectedModel,
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
                            if (messages.length === 1) {
                                const title =
                                    await generateTitleFromUserMessage({
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

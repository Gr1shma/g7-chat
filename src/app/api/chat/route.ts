import {
    type Message,
    createDataStreamResponse,
    smoothStream,
    streamText,
} from "ai";

import { generateTitleFromUserMessage } from "~/app/(chat)/actions";
import { auth } from "~/server/auth";
import {
    getMostRecentUserMessage,
    sanitizeResponseMessages,
} from "~/lib/utils";
import { google } from "@ai-sdk/google";
import { appRouter } from "~/server/api/root";
import { db } from "~/server/db";
import { messages_table } from "~/server/db/schema";

export const maxDuration = 60;

export async function POST(request: Request) {
    const { id, messages }: { id: string; messages: Array<Message> } =
        await request.json();


    const session = await auth();

    if (!session || !session.user || !session.user.id) {
        return new Response("Unauthorized", { status: 401 });
    }

    const userMessage = getMostRecentUserMessage(messages);

    if (!userMessage) {
        return new Response("No user message found", { status: 400 });
    }

    const caller = appRouter.createCaller({
        session,
        db: db,
        headers: request.headers,
    });

    const chat = await caller.chat.getChatById(id);

    if (!chat) {
        const title = await generateTitleFromUserMessage({
            message: userMessage,
        });
        await caller.chat.save({
            chatId: id,
            title,
        })
    }

    await db.insert(messages_table).values([{ ...userMessage, createdAt: new Date(), chatId: id }]);

    return createDataStreamResponse({
        execute: (dataStream) => {
            const result = streamText({
                model: google("gemini-2.0-flash-001"),
                messages,
                maxSteps: 5,
                experimental_transform: smoothStream({ chunking: "word" }),
                experimental_generateMessageId: crypto.randomUUID,
                onFinish: async ({ response, reasoning }) => {
                    if (session.user?.id) {
                        try {
                            const sanitizedResponseMessages =
                                sanitizeResponseMessages({
                                    messages: response.messages,
                                    reasoning,
                                });

                            await db.insert(messages_table).values(
                                sanitizedResponseMessages.map(
                                    (message) => {
                                        return {
                                            id: message.id,
                                            chatId: id,
                                            role: message.role,
                                            content: message.content,
                                            createdAt: new Date(),
                                        };
                                    }
                                )
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

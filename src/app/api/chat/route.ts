import {
    type Message,
    createDataStreamResponse,
    smoothStream,
    streamText,
} from "ai";

import { generateTitleFromUserMessage } from "~/app/(chat)/actions";
import { auth } from "~/server/auth";
import { MUTATIONS } from "~/server/db/mutations";
import { QUERIES } from "~/server/db/queries";
import {
    getMostRecentUserMessage,
    sanitizeResponseMessages,
} from "~/lib/utils";
import { google } from "@ai-sdk/google";
import { deleteThreadById } from "~/server/db/actions";

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

    const chat = await QUERIES.thread.getById({ id });

    if (!chat) {
        const title = await generateTitleFromUserMessage({
            message: userMessage,
        });
        await MUTATIONS.thread.save({
            id,
            userId: session.user.id,
            title,
        });
    }

    await MUTATIONS.message.save({
        messages: [{ ...userMessage, createdAt: new Date(), threadId: id }],
    });

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

                            await MUTATIONS.message.save({
                                messages: sanitizedResponseMessages.map(
                                    (message) => {
                                        return {
                                            id: message.id,
                                            threadId: id,
                                            role: message.role,
                                            content: message.content,
                                            createdAt: new Date(),
                                        };
                                    }
                                ),
                            });
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

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
        return new Response("Not Found", { status: 404 });
    }

    const session = await auth();

    if (!session || !session.user) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        const chat = await QUERIES.thread.getById({ id });
        if (!chat) {
            return new Response("Not Found", { status: 404 });
        }

        if (chat.userId !== session.user.id) {
            return new Response("Unauthorized", { status: 401 });
        }

        await deleteThreadById({ id });

        return new Response("Chat deleted", { status: 200 });
    } catch (error) {
        return new Response("An error occurred while processing your request", {
            status: 500,
        });
    }
}

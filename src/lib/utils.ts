import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type {
    CoreAssistantMessage,
    CoreToolMessage,
    Message,
    ToolInvocation,
} from "ai";

import type { DB_MESSAGE_TYPE } from "~/server/db/schema";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

function addToolMessageToThread({
    toolMessage,
    messages,
}: {
    toolMessage: CoreToolMessage;
    messages: Array<Message>;
}): Array<Message> {
    return messages.map((message) => {
        if (message.toolInvocations) {
            return {
                ...message,
                toolInvocations: message.toolInvocations.map(
                    (toolInvocation) => {
                        const toolResult = toolMessage.content.find(
                            (tool) =>
                                tool.toolCallId === toolInvocation.toolCallId
                        );

                        if (toolResult) {
                            return {
                                ...toolInvocation,
                                state: "result",
                                result: toolResult.result,
                            };
                        }

                        return toolInvocation;
                    }
                ),
            };
        }

        return message;
    });
}

export type CustomMessage = Message & { status: "done" | "error" };

export function convertToUIMessages(
    messages: Array<DB_MESSAGE_TYPE>
): Array<CustomMessage> {
    return messages.reduce((threadMessages: Array<CustomMessage>, message) => {
        if (message.role === "tool") {
            const toolMessages = addToolMessageToThread({
                toolMessage: message as CoreToolMessage,
                messages: threadMessages,
            }) as unknown as Array<CustomMessage>;

            return toolMessages.map((msg) => {
                if ("status" in msg) return msg;
                return { ...(msg as Message), status: "done" as const };
            });
        }

        let textContent = "";
        let reasoning: string | undefined = undefined;
        const toolInvocations: Array<ToolInvocation> = [];

        if (typeof message.content === "string") {
            textContent = message.content;
        } else if (Array.isArray(message.content)) {
            for (const content of message.content) {
                if (content.type === "text") {
                    textContent += content.text;
                } else if (content.type === "tool-call") {
                    toolInvocations.push({
                        state: "call",
                        toolCallId: content.toolCallId,
                        toolName: content.toolName,
                        args: content.args,
                    });
                } else if (content.type === "reasoning") {
                    reasoning = content.reasoning;
                }
            }
        }

        threadMessages.push({
            id: message.id,
            role: message.role as Message["role"],
            content: textContent,
            reasoning,
            toolInvocations,
            status: "done",
        });

        return threadMessages;
    }, [] as Array<CustomMessage>);
}

type ResponseMessageWithoutId = CoreToolMessage | CoreAssistantMessage;
type ResponseMessage = ResponseMessageWithoutId & { id: string };

export function sanitizeResponseMessages({
    messages,
}: {
    messages: Array<ResponseMessage>;
}) {
    const toolResultIds: Array<string> = [];

    for (const message of messages) {
        if (message.role === "tool") {
            for (const content of message.content) {
                if (content.type === "tool-result") {
                    toolResultIds.push(content.toolCallId);
                }
            }
        }
    }

    const sanitizedMessages = messages.map((message) => {
        if (message.role !== "assistant") {
            return message;
        }

        if (typeof message.content === "string") {
            return message;
        }

        const sanitizedContent = message.content.filter((content) =>
            content.type === "tool-call"
                ? toolResultIds.includes(content.toolCallId)
                : content.type === "text"
                  ? content.text.length > 0
                  : true
        );

        return {
            ...message,
            content: sanitizedContent,
        };
    });

    return sanitizedMessages.filter((message) =>
        Array.isArray(message.content)
            ? message.content.length > 0
            : !!message.content
    );
}

export function getMostRecentUserMessage(messages: Array<Message>) {
    const userMessages = messages.filter((message) => message.role === "user");
    return userMessages.at(-1);
}

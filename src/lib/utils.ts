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

function addToolMessageToChat({
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

export function convertToUIMessages(
    messages: Array<DB_MESSAGE_TYPE>
): Array<Message> {
    return messages.reduce((chatMessages: Array<Message>, message) => {
        if (message.role === "tool") {
            return addToolMessageToChat({
                toolMessage: message as CoreToolMessage,
                messages: chatMessages,
            });
        }

        let textContent = "";
        let reasoning: string | undefined = undefined;
        const toolInvocations: Array<ToolInvocation> = [];

        if (typeof message.content === "string") {
            textContent = message.content;
        } else if (Array.isArray(message.content)) {
            for (const content of message.content as Array<{
                type: string;
                text?: string;
                toolCallId?: string;
                toolName?: string;
                args?: unknown;
                reasoning?: string;
            }>) {
                if (content.type === "text") {
                    textContent += content.text ?? "";
                } else if (content.type === "tool-call") {
                    toolInvocations.push({
                        state: "call",
                        toolCallId: content.toolCallId ?? "",
                        toolName: content.toolName ?? "",
                        args: content.args as Record<string, unknown>,
                    });
                } else if (content.type === "reasoning") {
                    reasoning = content.reasoning;
                }
            }
        }

        chatMessages.push({
            id: message.id,
            role: message.role as Message["role"],
            content: textContent,
            reasoning,
            toolInvocations,
        });

        return chatMessages;
    }, []);
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

    const messagesBySanitizedContent = messages.map((message) => {
        if (message.role !== "assistant") return message;

        if (typeof message.content === "string") return message;

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

    return messagesBySanitizedContent.filter(
        (message) => message.content.length > 0
    );
}

export function getMostRecentUserMessage(messages: Array<Message>) {
    const userMessages = messages.filter((message) => message.role === "user");
    return userMessages.at(-1);
}

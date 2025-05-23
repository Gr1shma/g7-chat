import type { Message } from "ai";

export function getLatestUserMessageIndex(
    messages: Message[],
    initialLength: number
) {
    return [...messages]
        .map((m, i) => ({ m, i }))
        .reverse()
        .find(({ m, i }) => i >= initialLength && m.role === "user")?.i;
}

export function getNextAssistantIndex(
    messages: Message[],
    latestUserIndex?: number
) {
    if (latestUserIndex === undefined) {
        return -1;
    }

    return messages.findIndex(
        (m, i) => i > latestUserIndex && m.role !== "user"
    );
}

export function shouldShowAssistantSpace(
    latestUserIndex: number | undefined,
    nextAssistantIndex: number,
    messages: Message[]
) {
    return (
        latestUserIndex !== undefined &&
        (nextAssistantIndex === -1 ||
            messages[nextAssistantIndex]?.content === "")
    );
}

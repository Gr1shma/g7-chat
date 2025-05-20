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
    return messages.findIndex(
        (m, i) => i > (latestUserIndex ?? -1) && m.role !== "user"
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

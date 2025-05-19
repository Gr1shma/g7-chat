"use client";

import type { Message } from "ai";
import { useEffect, useRef } from "react";
import MessageItem from "./thread-message-item";

interface ThreadMessagesProps {
    messages: Message[];
    initialMessageLength: number;
}

export function ThreadMessages({ messages, initialMessageLength }: ThreadMessagesProps) {
    const latestUserIndex = getLatestUserMessageIndex(messages, initialMessageLength);
    const nextAssistantIndex = getNextAssistantIndex(messages, latestUserIndex);

    const userRef = useRef<HTMLDivElement>(null);
    const assistantSpaceRef = useRef<HTMLDivElement>(null);

    const showAssistantSpace = shouldShowAssistantSpace(
        latestUserIndex,
        nextAssistantIndex,
        messages
    );
    const isNotFirstUserMessage = messages.filter((m) => m.role === "user").length > 1;

    useEffect(() => {
        if (userRef.current) {
            userRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
            if (assistantSpaceRef.current) {
                setTimeout(() => {
                    assistantSpaceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 100);
            }
        }
    }, [latestUserIndex]);

    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col space-y-12 px-4 pb-10 pt-safe-offset-10">
            {messages.map((m, index) => (
                <MessageItem
                    key={m.id}
                    message={m}
                    index={index}
                    latestUserIndex={latestUserIndex}
                    nextAssistantIndex={nextAssistantIndex}
                    userRef={userRef}
                    assistantSpaceRef={assistantSpaceRef}
                    showAssistantSpace={showAssistantSpace}
                    isNotFirstUserMessage={isNotFirstUserMessage}
                />
            ))}
        </div>
    );
}

function getLatestUserMessageIndex(messages: Message[], initialLength: number) {
    return [...messages]
        .map((m, i) => ({ m, i }))
        .reverse()
        .find(({ m, i }) => i >= initialLength && m.role === "user")?.i;
}

function getNextAssistantIndex(messages: Message[], latestUserIndex?: number) {
    return messages.findIndex(
        (m, i) => i > (latestUserIndex ?? -1) && m.role !== "user"
    );
}

function shouldShowAssistantSpace(
    latestUserIndex: number | undefined,
    nextAssistantIndex: number,
    messages: Message[]
) {
    return (
        latestUserIndex !== undefined &&
        (nextAssistantIndex === -1 || messages[nextAssistantIndex]?.content === "")
    );
}

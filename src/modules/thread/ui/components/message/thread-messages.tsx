"use client";

import { useEffect, useRef } from "react";
import { type Message } from "ai";
import { type UseChatHelpers } from "ai/react";

import { MessageItem } from "./thread-message-item";
import {
    getLatestUserMessageIndex,
    getNextAssistantIndex,
    shouldShowAssistantSpace,
} from "./thread-message.utils";

export interface ThreadMessagesProps {
    messages: Message[];
    initialMessageLength: number;
    append: UseChatHelpers["append"];
}

export function ThreadMessages({
    append,
    messages,
    initialMessageLength,
}: ThreadMessagesProps) {
    const latestUserIndex = getLatestUserMessageIndex(
        messages,
        initialMessageLength
    );
    const nextAssistantIndex = getNextAssistantIndex(messages, latestUserIndex);

    const userRef = useRef<HTMLDivElement>(null);
    const assistantSpaceRef = useRef<HTMLDivElement>(null);

    const showAssistantSpace = shouldShowAssistantSpace(
        latestUserIndex,
        nextAssistantIndex,
        messages
    );
    const isNotFirstUserMessage =
        messages.filter((m) => m.role === "user").length > 1;

    useEffect(() => {
        if (userRef.current) {
            userRef.current.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
            if (assistantSpaceRef.current) {
                setTimeout(() => {
                    assistantSpaceRef.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                    });
                }, 100);
            }
        }
    }, [latestUserIndex]);

    return (
        <div className="pt-safe-offset-10 mx-auto flex w-full max-w-3xl flex-col space-y-12 px-4 pb-10 pt-10">
            {messages.map((m, index) => (
                <MessageItem
                    key={m.id}
                    message={m}
                    messages={messages}
                    index={index}
                    latestUserIndex={latestUserIndex}
                    nextAssistantIndex={nextAssistantIndex}
                    userRef={userRef}
                    assistantSpaceRef={assistantSpaceRef}
                    showAssistantSpace={showAssistantSpace}
                    isNotFirstUserMessage={isNotFirstUserMessage}
                    append={append}
                />
            ))}
        </div>
    );
}

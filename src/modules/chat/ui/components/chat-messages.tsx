"use client";

import type { Message } from "ai";
import { useEffect, useRef } from "react";
import { Markdown } from "~/components/markdown";

interface ChatMessagesProps {
    messages: Message[];
    initialMessageLength: number;
}

export function ChatMessages({
    messages,
    initialMessageLength,
}: ChatMessagesProps) {
    const latestUserIndex = [...messages]
        .map((m, i) => ({ m, i }))
        .reverse()
        .find(({ m, i }) => i >= initialMessageLength && m.role === "user")?.i;

    const nextAssistantIndex = messages.findIndex(
        (m, i) => i > (latestUserIndex ?? -1) && m.role !== "user"
    );

    const userRef = useRef<HTMLDivElement>(null);
    const assistantSpaceRef = useRef<HTMLDivElement>(null);

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

    const showAssistantSpace =
        latestUserIndex !== undefined &&
        (nextAssistantIndex === -1 ||
            messages[nextAssistantIndex]?.content === "");

    const isNotFirstUserMessage =
        messages.filter((m) => m.role === "user").length > 1;

    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col p-4 pb-8">
            {messages.map((m, index) => {
                const isLatestUser = index === latestUserIndex;
                const isNextAssistant = index === nextAssistantIndex;

                return (
                    <div key={m.id}>
                        {m.role === "user" ? (
                            <div
                                ref={isLatestUser ? userRef : null}
                                className={`flex justify-end ${isLatestUser ? "pt-4" : ""} mb-12`}
                            >
                                <div className="group relative inline-block max-w-[80%] break-words rounded-2xl bg-[#2D2D2D] p-4 text-left">
                                    {m.content}
                                </div>
                            </div>
                        ) : (
                            <div
                                className={`mb-11 flex justify-start ${isNextAssistant ? "min-h-[calc(100vh-20rem)]" : ""}`}
                            >
                                <div className="group relative w-full max-w-full break-words">
                                    <Markdown>{m.content}</Markdown>
                                </div>
                            </div>
                        )}

                        {isLatestUser &&
                            showAssistantSpace &&
                            isNotFirstUserMessage && (
                                <div
                                    ref={assistantSpaceRef}
                                    className="mb-10 h-[calc(100vh-20rem)] w-full"
                                    aria-hidden="true"
                                />
                            )}
                    </div>
                );
            })}
        </div>
    );
}

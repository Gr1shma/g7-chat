"use client";

import { type Message, useChat } from "ai/react";
import { useRef, useEffect } from "react";
import { api } from "~/trpc/react";
import { ThreadMessages } from "../components/message/thread-messages";
import { useScrollToBottomButton } from "~/hooks/use-scroll-button";
import { ScrollToBottomButton } from "~/components/scroll-to-bottom-button";
import { ThreadInputForm } from "../components/input/thread-input-form";

interface ThreadViewProps {
    threadId: string;
    initialMessages: Array<Message>;
}

export function ThreadView({ threadId, initialMessages }: ThreadViewProps) {
    const bottomRef = useRef<HTMLDivElement | null>(null);
    const threadContainerRef = useRef<HTMLDivElement | null>(null);

    const { showScrollButton, handleScroll } =
        useScrollToBottomButton(threadContainerRef);

    const utils = api.useUtils();

    const {
        input,
        setInput,
        isLoading,
        messages,
        setMessages,
        handleSubmit,
        stop,
        status,
        append,
    } = useChat({
        id: threadId,
        initialMessages,
        experimental_throttle: 100,
        sendExtraMessageFields: true,
        onFinish: async () => {
            await utils.thread.invalidate();
        },
    });

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }, []);

    return (
        <>
            <div className="absolute bottom-0 w-full pr-2">
                <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col text-center">
                    <div className="flex justify-center pb-4">
                        <ScrollToBottomButton
                            show={showScrollButton}
                            onClick={() =>
                                bottomRef.current?.scrollIntoView({
                                    behavior: "smooth",
                                })
                            }
                        />
                    </div>
                    <ThreadInputForm
                        setMessages={setMessages}
                        isLoading={isLoading}
                        input={input}
                        threadId={threadId}
                        setInput={setInput}
                        handleSubmit={handleSubmit}
                        stop={stop}
                        status={status}
                    />
                </div>
            </div>

            <div className="relative flex-1 overflow-hidden">
                <div
                    className="scrollbar scrollbar-w-2 scrollbar-thumb-gray-700 scrollbar-track-transparent hover:scrollbar-thumb-gray-600 h-[100dvh] overflow-y-auto pb-[140px]"
                    onScroll={handleScroll}
                    ref={threadContainerRef}
                >
                    <ThreadMessages
                        messages={messages}
                        initialMessageLength={initialMessages.length}
                        append={append}
                    />
                    <div ref={bottomRef}></div>
                </div>
            </div>
        </>
    );
}

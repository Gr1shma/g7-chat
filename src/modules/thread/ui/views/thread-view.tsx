"use client";

import { type Message, useChat as useThread } from "ai/react";
import { useState, useRef, useEffect } from "react";
import { ChevronDown as ChevronDownIcon } from "lucide-react";

import { api } from "~/trpc/react";
import { ThreadInputForm } from "../components/thread-input";
import { ThreadMessages } from "../components/thread-messages";
import { Button } from "~/components/ui/button";

interface ThreadViewProps {
    threadId: string;
    initialMessages: Array<Message>;
}

export function ThreadView({ threadId, initialMessages }: ThreadViewProps) {
    const bottomRef = useRef<HTMLDivElement | null>(null);
    const threadContainerRef = useRef<HTMLDivElement | null>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);

    const utils = api.useUtils();

    const handleScroll = () => {
        if (threadContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } =
                threadContainerRef.current;
            setShowScrollButton(scrollTop + clientHeight < scrollHeight - 50);
        }
    };

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }, []);

    const {
        input,
        setInput,
        isLoading,
        messages,
        setMessages,
        handleSubmit,
        stop,
        status,
    } = useThread({
        id: threadId,
        initialMessages,
        experimental_throttle: 100,
        sendExtraMessageFields: true,
        onFinish: async () => {
            await utils.thread.invalidate();
        },
    });

    return (
        <>
            <div className="absolute bottom-0 w-full pr-2">
                <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col text-center">
                    <div className="flex justify-center pb-4">
                        {showScrollButton ? (
                            <Button
                                variant="default"
                                className="flex h-8 items-center gap-2 rounded-full bg-secondary px-3 text-xs text-secondary-foreground opacity-90 shadow-sm hover:bg-secondary/80 hover:opacity-100"
                                onClick={() => {
                                    bottomRef.current?.scrollIntoView({
                                        behavior: "smooth",
                                    });
                                }}
                            >
                                Scroll to bottom{" "}
                                <ChevronDownIcon className="size-4" />
                            </Button>
                        ) : null}
                    </div>
                    <div className="border-reflect relative rounded-t-[20px] bg-[--thread-input-background] p-2 pb-0 backdrop-blur-lg ![--c:--thread-input-gradient]">
                        <form className="dark:outline-thread-background/40 relative flex w-full flex-col items-stretch gap-2 rounded-t-xl border border-b-0 border-white/70 bg-[--thread-input-background] px-3 py-3 text-secondary-foreground outline outline-8 outline-[hsl(var(--thread-input-gradient)/0.5)] dark:border-[hsl(0,0%,83%)]/[0.04] dark:bg-secondary/[0.045] max-sm:pb-6 sm:max-w-3xl">
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
                        </form>
                    </div>
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
                    />
                    <div ref={bottomRef}></div>
                </div>
            </div>
        </>
    );
}

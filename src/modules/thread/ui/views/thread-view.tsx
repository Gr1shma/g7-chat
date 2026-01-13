"use client";

import { type Message, useChat } from "ai/react";
import { useRef, useEffect, useState } from "react";
import { toast } from "~/hooks/use-toast";
import { api } from "~/trpc/react";
import { ThreadMessages } from "../components/message/thread-messages";
import { useScrollToBottomButton } from "~/hooks/use-scroll-button";
import { ScrollToBottomButton } from "~/components/scroll-to-bottom-button";
import { ThreadInputForm } from "../components/input/thread-input-form";
import { useAPIKeyStore } from "~/lib/ai/api-keys-store";
import { useModelStore } from "~/lib/ai/model-store";
import { useSession } from "next-auth/react";
import { useGuestRateLimitStore } from "~/stores/guest-limit-store";

interface ThreadViewProps {
    threadId: string;
    initialMessages: Message[];
}

export function ThreadViewSection({
    threadId,
    initialMessages,
}: ThreadViewProps) {
    const bottomRef = useRef<HTMLDivElement | null>(null);
    const threadContainerRef = useRef<HTMLDivElement | null>(null);

    const { showScrollButton, handleScroll } =
        useScrollToBottomButton(threadContainerRef);

    const utils = api.useUtils();

    const { getKey } = useAPIKeyStore();
    const hasAnyApiKey = useAPIKeyStore((state) => state.hasRequiredKeys());
    const selectedModel = useModelStore((state) => state.selectedModel);
    const modelConfig = useModelStore((state) => state.getModelConfig());

    const { data: session } = useSession();
    const isGuest = session?.user?.isGuest ?? false;

    const { getRemainingMessages, incrementMessageCount } =
        useGuestRateLimitStore();

    const headers = modelConfig
        ? { [modelConfig.headerKey]: getKey(modelConfig.provider) ?? "" }
        : {};

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
        error,
    } = useChat({
        id: threadId,
        initialMessages,
        experimental_throttle: 100,
        sendExtraMessageFields: true,
        body: {
            model: selectedModel,
        },
        headers,
        onFinish: () => {
            void utils.thread.invalidate();
            if (isGuest && !hasAnyApiKey) {
                incrementMessageCount();
            }
        },
        onError: (error) => {
            let errorMessage =
                "An unexpected error occurred. Please try again.";

            if (error.message) {
                try {
                    const parsed = JSON.parse(error.message) as {
                        error?: string;
                        limitReached?: boolean;
                    };
                    errorMessage = parsed.error ?? error.message;

                    if (parsed.limitReached) {
                        toast({
                            title: "Daily Limit Reached",
                            description: errorMessage,
                            variant: "destructive",
                        });
                        return;
                    }
                } catch {
                    errorMessage = error.message;
                }
            }

            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        },
    });

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }, []);

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    const guestRemainingMessages =
        isGuest && !hasAnyApiKey ? getRemainingMessages() : null;

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
                    {guestRemainingMessages !== null && (
                        <div className="mb-2 text-center text-xs text-neutral-500">
                            {guestRemainingMessages > 0 ? (
                                <span>
                                    Guest mode:{" "}
                                    <span
                                        className={
                                            guestRemainingMessages <= 3
                                                ? "text-amber-500"
                                                : "text-green-500"
                                        }
                                    >
                                        {guestRemainingMessages}
                                    </span>{" "}
                                    messages remaining today
                                </span>
                            ) : (
                                <span className="text-red-400">
                                    Daily limit reached. Add API keys or sign in
                                    to continue.
                                </span>
                            )}
                        </div>
                    )}
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
                        error={error}
                        onRetry={() => {
                            const lastUserMessage = [...messages]
                                .reverse()
                                .find((m) => m.role === "user");
                            if (
                                lastUserMessage &&
                                typeof lastUserMessage.content === "string"
                            ) {
                                void append({
                                    role: "user",
                                    content: lastUserMessage.content,
                                });
                            }
                        }}
                    />
                    <div ref={bottomRef}></div>
                </div>
            </div>
        </>
    );
}

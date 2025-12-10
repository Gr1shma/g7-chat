"use client";

import { type Message, useChat } from "ai/react";
import { useRef, useEffect } from "react";
import { toast } from "~/hooks/use-toast";
import { api } from "~/trpc/react";
import { ThreadMessages } from "../components/message/thread-messages";
import { useScrollToBottomButton } from "~/hooks/use-scroll-button";
import { ScrollToBottomButton } from "~/components/scroll-to-bottom-button";
import { ThreadInputForm } from "../components/input/thread-input-form";
import { useAPIKeyStore } from "~/lib/ai/api-keys-store";
import { useModelStore } from "~/lib/ai/model-store";
import APIKeyForm from "~/modules/setting/ui/components/tabs/api-keys-tab";

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
    const selectedModel = useModelStore((state) => state.selectedModel);
    const modelConfig = useModelStore((state) => state.getModelConfig());
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
        },
        onError: (error) => {
            let errorMessage =
                "An unexpected error occurred. Please try again.";

            if (error.message) {
                try {
                    const parsed = JSON.parse(error.message) as {
                        error?: string;
                    };
                    errorMessage = parsed.error ?? error.message;
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

    const hasRequiredKeys = useAPIKeyStore((state) => state.hasRequiredKeys());

    const isAPIKeysHydrated = useAPIKeyStore.persist?.hasHydrated();
    const isModelStoreHydrated = useModelStore.persist?.hasHydrated();

    if (!isAPIKeysHydrated || !isModelStoreHydrated) return null;

    if (!hasRequiredKeys)
        return (
            <div className="flex min-h-screen flex-col justify-center pr-10">
                <APIKeyForm />
            </div>
        );

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
                        error={error}
                        onRetry={() => {
                            // Get the last user message to retry
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

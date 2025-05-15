"use client";

import { Message, useChat } from "ai/react";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "~/trpc/react";

import { ChatInputForm } from "../components/chat-input";
import { ChatMessages } from "../components/chat-messages";
import { Button } from "~/components/ui/button";
import { ChevronDown as ChevronDownIcon } from "lucide-react";

interface ChatViewProps {
    chatId: string;
    initialMessages: Array<Message>;
}

export function ChatView({ chatId, initialMessages }: ChatViewProps) {
    const router = useRouter();
    const bottomRef = useRef<HTMLDivElement | null>(null);
    const chatContainerRef = useRef<HTMLDivElement | null>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);

    const utils = api.useUtils();

    const handleScroll = () => {
        if (chatContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
            setShowScrollButton(scrollTop + clientHeight < scrollHeight - 50);
        }
    };

    const {
        input,
        setInput,
        isLoading,
        messages,
        setMessages,
        handleSubmit,
        stop,
    } = useChat({
        id: chatId,
        initialMessages,
        experimental_throttle: 100,
        sendExtraMessageFields: true,
        onFinish: () => {
            utils.chat.getInfiniteChats.invalidate();
            router.refresh();
        },
        onError: () => {
            toast("An error occurred");
        },
    });

    const handleFormSubmit = (event?: { preventDefault?: () => void }, options?: any) => {
        if (messages.length === 0 && input.trim()) {
            utils.chat.getInfiniteChats.setInfiniteData(
                { limit: 20 },
                // @ts-ignore
                (oldData) => {
                    if (!oldData) return oldData;

                    const optimisticChat = {
                        id: chatId,
                        title: "New Chat",
                        createdAt: new Date(),
                        userId: "current-user",
                        updatedAt: new Date(),
                    };

                    if (!oldData.pages || oldData.pages.length === 0) {
                        return {
                            ...oldData,
                            pages: [{
                                items: [optimisticChat],
                                nextCursor: null
                            }]
                        };
                    }

                    return {
                        ...oldData,
                        pages: [
                            {
                                ...oldData.pages[0],
                                // @ts-ignore
                                items: [optimisticChat, ...oldData.pages[0].items]
                            },
                            ...oldData.pages.slice(1)
                        ]
                    };
                }
            );
        }
        handleSubmit(event, options);
    };

    return (
        <>
            <div className="absolute bottom-5 w-full pr-2">
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
                    <form className="relative flex w-full flex-col items-stretch gap-2 rounded-xl bg-[#2D2D2D] px-3 py-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] sm:max-w-3xl">
                        <ChatInputForm
                            isLoading={isLoading}
                            input={input}
                            chatId={chatId}
                            setInput={setInput}
                            handleSubmit={handleFormSubmit}
                            stop={stop}
                            messages={messages}
                            setMessages={setMessages}
                        />
                    </form>
                </div>
            </div>
            <div className="relative flex-1 overflow-hidden">
                <div
                    className="scrollbar scrollbar-w-2 scrollbar-thumb-gray-700 scrollbar-track-transparent hover:scrollbar-thumb-gray-600 h-[100dvh] overflow-y-auto pb-[140px]"
                    onScroll={handleScroll}
                    ref={chatContainerRef}
                >
                    <ChatMessages messages={messages} />
                    <div ref={bottomRef}></div>
                </div>
            </div>
        </>
    );
}

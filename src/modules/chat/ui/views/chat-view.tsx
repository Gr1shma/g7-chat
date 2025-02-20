"use client";

import { useChat } from "ai/react";
import { useState, useRef } from "react";

import { ChatInputForm } from "../components/chat-input";
import { ChatMessages } from "../components/chat-messages";
import { Button } from "~/components/ui/button";
import { ChevronDown as ChevronDownIcon } from "lucide-react";

interface ChatViewProps {
    chatId: string;
}


export function ChatView({ chatId }: ChatViewProps) {
    const bottomRef = useRef<HTMLDivElement | null>(null);

    const chatContainerRef = useRef<HTMLDivElement | null>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);

    const handleScroll = () => {
        if (chatContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
            setShowScrollButton(scrollTop + clientHeight < scrollHeight - 50);
        }
    };

    const { input, setInput, isLoading, messages, handleSubmit } = useChat({
        id: chatId,
        experimental_throttle: 100,
        sendExtraMessageFields: true,
        onFinish: (message) => {
            console.log(message);
        },
        onError: (error) => {
            console.error("Error", error);
        },
    });

    return (
        <>
            <div className="absolute bottom-5 w-full pr-2">
                <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col text-center">
                    <div className="flex justify-center pb-4">
                        {showScrollButton ? (
                            <Button
                                variant="default"
                                className="h-8 px-3 text-xs flex items-center gap-2 rounded-full bg-[#404040] text-white opacity-90 hover:opacity-100"
                                onClick={() => {
                                    console.log(bottomRef.current);
                                    bottomRef.current?.scrollIntoView({
                                        behavior: "smooth"
                                    })
                                }}
                            >
                                Scroll to bottom <ChevronDownIcon className="size-4" />
                            </Button>
                        ) : null}
                    </div>
                    <form className="relative flex w-full flex-col items-stretch gap-2 rounded-xl bg-[#2D2D2D] px-3 py-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] sm:max-w-3xl">
                        <ChatInputForm
                            isLoading={isLoading}
                            input={input}
                            chatId={chatId}
                            handleSubmitAction={handleSubmit}
                            setInputAction={setInput}
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
                    <ChatMessages chatId={chatId} messages={messages} />
                    <div ref={bottomRef}></div>
                </div>
            </div>
        </>
    );
}

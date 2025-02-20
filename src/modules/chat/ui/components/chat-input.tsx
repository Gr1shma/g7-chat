"use client";

import type { ChatRequestOptions } from "ai";

import { Button } from "~/components/ui/button";
import { Send as SendIcon } from "lucide-react";
import { useCallback } from "react";

interface ChatInputProps {
    chatId: string;
    input: string;
    isLoading: boolean;
    setInputAction: (value: string) => void;
    handleSubmitAction: (
        event?: {
            preventDefault?: () => void;
        },
        chatRequestOptions?: ChatRequestOptions
    ) => void;
}

export function ChatInputForm({
    chatId,
    input,
    isLoading,
    setInputAction,
    handleSubmitAction,
}: ChatInputProps) {
    const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputAction(event.target.value);
    };

    const submitForm = useCallback(() => {
        // window.history.replaceState({}, "", `/chat/${chatId}`);
        handleSubmitAction();
    }, [handleSubmitAction, chatId]);

    return (
        <div>
            <textarea
                className="text-black outline-none disabled:opacity-0"
                value={input}
                onChange={handleInput}
                onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        if (isLoading) {
                            console.error(
                                "Please wait for the model to finish its response!"
                            );
                        } else {
                            submitForm();
                        }
                    }
                }}
            />
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <div className="flex items-center gap-0.5"></div>
                <Button
                    type="submit"
                    variant="ghost"
                    className="hover:text-whilte absolute bottom-3 right-3 h-10 w-10 rounded-full bg-[#1a1a1a] p-2 text-white hover:bg-primary/30"
                    aria-label="Send Message"
                    onClick={(event) => {
                        event.preventDefault();
                        submitForm();
                    }}
                >
                    <SendIcon />
                </Button>
            </div>
        </div>
    );
}

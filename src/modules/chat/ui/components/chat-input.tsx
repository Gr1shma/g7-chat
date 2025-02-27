"use client";

interface ChatInputProps {
    threadId: string;
    input: string;
    setInput: (value: string) => void;
    isLoading: boolean;
    stop: () => void;
    handleSubmit: (
        event?: {
            preventDefault?: () => void;
        },
        chatRequestOptions?: ChatRequestOptions
    ) => void;
}

import type { ChatRequestOptions } from "ai";

import type React from "react";

import { useRef, useEffect, useCallback, memo } from "react";

import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { SendIcon } from "lucide-react";

function PureChatInput({
    threadId,
    input,
    setInput,
    isLoading,
    handleSubmit,
}: ChatInputProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            adjustHeight();
        }
    }, []);

    const adjustHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
        }
    };

    const resetHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = "48px";
        }
    };

    const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(event.target.value);
        adjustHeight();
    };

    const submitForm = useCallback(() => {
        window.history.replaceState({}, "", `/chat/${threadId}`);
        handleSubmit();
        resetHeight();
    }, [handleSubmit, threadId]);

    return (
        <div>
            <textarea
                ref={textareaRef}
                placeholder="Type your message here..."
                value={input}
                onChange={handleInput}
                className="h-auto max-h-[240px] min-h-[48px] w-full resize-none overflow-y-auto bg-transparent text-base leading-6 text-neutral-100 outline-none disabled:opacity-0"
                rows={2}
                autoFocus
                onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();

                        if (isLoading) {
                            toast.error(
                                "Please wait for the model to finish its response!"
                            );
                        } else {
                            submitForm();
                        }
                    }
                }}
            />
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <div className="flex items-center gap-0.5">
                    {/* Modal Select | Link | Image */}
                </div>
                <Button
                    type="submit"
                    variant="ghost"
                    className="absolute bottom-3 right-3 h-9 w-9 rounded-full bg-pink-600/70 p-2 text-neutral-100 shadow hover:bg-pink-500/70"
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

export const ChatInputForm = memo(PureChatInput, (prevProps, nextProps) => {
    if (prevProps.input !== nextProps.input) return false;
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    return true;
});

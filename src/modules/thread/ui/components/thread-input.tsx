"use client";

import type { ChatRequestOptions as ThreadRequestOptions } from "ai";
import type React from "react";
import { useRef, useEffect, useCallback, memo } from "react";

import { Button } from "~/components/ui/button";
import { ArrowUpIcon, Square } from "lucide-react";
import type { UseChatHelpers } from "ai/react";

interface ThreadInputProps {
    threadId: string;
    input: string;
    setInput: (value: string) => void;
    isLoading: boolean;
    stop: () => void;
    handleSubmit: (
        event?: {
            preventDefault?: () => void;
        },
        chatRequestOptions?: ThreadRequestOptions
    ) => void;
    status: UseChatHelpers["status"];
    setMessages: UseChatHelpers["setMessages"];
}

function PureThreadInput({
    threadId,
    input,
    setInput,
    isLoading,
    handleSubmit,
    status,
    setMessages,
    stop,
}: ThreadInputProps) {
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
        <div className="border-reflect relative rounded-t-[20px] bg-[--thread-input-background] p-2 pb-0 backdrop-blur-lg ![--c:--thread-input-gradient]">
            <form className="dark:outline-thread-background/40 relative flex w-full flex-col items-stretch gap-2 rounded-t-xl border border-b-0 border-white/70 bg-[--thread-input-background] px-3 py-3 text-secondary-foreground outline outline-8 outline-[hsl(var(--thread-input-gradient)/0.5)] dark:border-[hsl(0,0%,83%)]/[0.04] dark:bg-secondary/[0.045] max-sm:pb-6 sm:max-w-3xl">
                <div className="flex flex-grow flex-col">
                    <div className="flex flex-grow flex-row items-start">
                        <textarea
                            ref={textareaRef}
                            placeholder="Type your message here..."
                            value={input}
                            onChange={handleInput}
                            className="max-h-32 w-full resize-none bg-transparent text-base leading-6 text-foreground outline-none placeholder:text-secondary-foreground/60 disabled:opacity-0"
                            rows={2}
                            autoFocus
                            onKeyDown={(event) => {
                                if (event.key === "Enter" && !event.shiftKey) {
                                    event.preventDefault();
                                    if (!isLoading) {
                                        submitForm();
                                    }
                                }
                            }}
                        />
                        <div className="sr-only">
                            Press Enter to send, Shift + Enter for new line
                        </div>
                    </div>
                    <div className="-mb-px mt-2 flex w-full flex-row-reverse justify-between">
                        <div className="-mr-0.5 -mt-0.5 flex items-center justify-center gap-2">
                            {status === "submitted" ? (
                                <StopButton
                                    stop={stop}
                                    setMessages={setMessages}
                                />
                            ) : (
                                <SendButton
                                    input={input}
                                    submitForm={submitForm}
                                />
                            )}
                        </div>
                        <div className="flex flex-col gap-2 md:flex-row md:items-center">
                            <div className="ml-[-7px] flex items-center gap-1">
                                {/* Modal Select | Link */}
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

export const ThreadInputForm = memo(PureThreadInput, (prevProps, nextProps) => {
    if (prevProps.input !== nextProps.input) return false;
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    return true;
});

function PureStopButton({
    stop,
    setMessages,
}: {
    stop: () => void;
    setMessages: UseChatHelpers["setMessages"];
}) {
    return (
        <Button
            data-testid="stop-button"
            variant="default"
            className="relative h-9 w-9 rounded-lg p-2"
            onClick={(event) => {
                event.preventDefault();
                stop();
                setMessages((messages) => messages);
            }}
        >
            <Square
                className="size-5"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth={2}
            />
        </Button>
    );
}

const StopButton = memo(PureStopButton);

function PureSendButton({
    submitForm,
    input,
}: {
    submitForm: () => void;
    input: string;
}) {
    return (
        <Button
            data-testid="send-button"
            variant="default"
            className="relative h-9 w-9 rounded-lg p-2"
            onClick={(event) => {
                event.preventDefault();
                submitForm();
            }}
            disabled={input.length === 0}
        >
            <ArrowUpIcon
                className="size-5"
                stroke="currentColor"
                strokeWidth={2}
            />
        </Button>
    );
}

const SendButton = memo(PureSendButton, (prevProps, nextProps) => {
    if (prevProps.input !== nextProps.input) return false;
    return true;
});

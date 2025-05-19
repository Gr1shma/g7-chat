"use client";

import type { ChatRequestOptions as ThreadRequestOptions } from "ai";
import type { UseChatHelpers as UseThreadHelpers } from "ai/react";
import { memo, useCallback } from "react";
import { InputToolbar } from "./thread-input-toolbar";
import { useTextareaAutosize } from "~/hooks/use-textarea-autosize";
import { ThreadInputTextarea } from "./thread-input-text-area";

interface ThreadInputProps {
    threadId: string;
    input: string;
    setInput: (value: string) => void;
    isLoading: boolean;
    stop: () => void;
    handleSubmit: (
        event?: { preventDefault?: () => void },
        chatRequestOptions?: ThreadRequestOptions
    ) => void;
    status: UseThreadHelpers["status"];
    setMessages: UseThreadHelpers["setMessages"];
}

function PureThreadInput({
    threadId,
    input,
    setInput,
    isLoading,
    stop,
    handleSubmit,
    status,
    setMessages,
}: ThreadInputProps) {
    const { textareaRef, adjustHeight, resetHeight } = useTextareaAutosize(input);

    const submitForm = useCallback(() => {
        window.history.replaceState({}, "", `/chat/${threadId}`);
        handleSubmit();
        resetHeight();
    }, [handleSubmit, threadId, resetHeight]);

    return (
        <div className="border-reflect relative rounded-t-[20px] bg-[--thread-input-background] p-2 pb-0 backdrop-blur-lg ![--c:--thread-input-gradient]">
            <form className="dark:outline-thread-background/40 relative flex w-full flex-col items-stretch gap-2 rounded-t-xl border border-b-0 border-white/70 bg-[--thread-input-background] px-3 py-3 text-secondary-foreground outline outline-8 outline-[hsl(var(--thread-input-gradient)/0.5)] dark:border-[hsl(0,0%,83%)]/[0.04] dark:bg-secondary/[0.045] max-sm:pb-6 sm:max-w-3xl">
                <div className="flex flex-col">
                    <ThreadInputTextarea
                        ref={textareaRef}
                        input={input}
                        setInput={setInput}
                        onHeightChange={adjustHeight}
                        onSubmit={submitForm}
                        isLoading={isLoading}
                    />
                    <InputToolbar
                        input={input}
                        status={status}
                        stop={stop}
                        submitForm={submitForm}
                        setMessages={setMessages}
                    />
                </div>
            </form>
        </div>
    );
}

export const ThreadInputForm = memo(PureThreadInput);

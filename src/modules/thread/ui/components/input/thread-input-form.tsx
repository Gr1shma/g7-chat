"use client";

import { memo, useCallback, useEffect } from "react";
import { useTextareaAutosize } from "~/hooks/use-textarea-autosize";
import { ThreadInputTextarea } from "./thread-input-text-area";
import { type ThreadInputProps } from "./thread-input.types";
import { useLocalStorage } from "usehooks-ts";
import { InputToolbar } from "./toolbar";

function PureThreadInput({
    threadId,
    input,
    setInput,
    isLoading,
    handleSubmit,
    status,
    selectedModel,
    onModelChange,
}: ThreadInputProps) {
    const { textareaRef, adjustHeight, resetHeight } =
        useTextareaAutosize(input);

    const [localStorageInput, setLocalStorageInput] = useLocalStorage(
        "input",
        ""
    );

    useEffect(() => {
        if (textareaRef.current) {
            const domValue = textareaRef.current.value;
            const finalValue = domValue || localStorageInput || "";
            setInput(finalValue);
            adjustHeight();
        }
    }, []);

    useEffect(() => {
        setLocalStorageInput(input);
    }, [input, setLocalStorageInput]);

    const submitForm = useCallback(() => {
        window.history.replaceState({}, "", `/chat/${threadId}`);
        handleSubmit();
        setLocalStorageInput("");
        resetHeight();
    }, [handleSubmit, threadId, resetHeight, setLocalStorageInput]);

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
                        submitForm={submitForm}
                        onModelChange={onModelChange}
                        selectedModel={selectedModel}
                    />
                </div>
            </form>
        </div>
    );
}

export const ThreadInputForm = memo(PureThreadInput);

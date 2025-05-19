import React, { forwardRef } from "react";

interface Props {
    input: string;
    setInput: (val: string) => void;
    isLoading: boolean;
    onHeightChange: () => void;
    onSubmit: () => void;
}

export const ThreadInputTextarea = forwardRef<HTMLTextAreaElement, Props>(
    ({ input, setInput, isLoading, onHeightChange, onSubmit }, ref) => {
        return (
            <textarea
                ref={ref}
                value={input}
                onChange={(e) => {
                    setInput(e.target.value);
                    onHeightChange();
                }}
                placeholder="Type your message here..."
                className="max-h-32 w-full resize-none bg-transparent text-base leading-6 text-foreground outline-none placeholder:text-secondary-foreground/60 disabled:opacity-0"
                rows={2}
                autoFocus
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (!isLoading) {
                            onSubmit();
                        }
                    }
                }}
            />
        );
    }
);

ThreadInputTextarea.displayName = "ThreadInputTextarea";

import React, { forwardRef } from "react";
import { ThreadInputTextareaProps } from "./thread-input.types";

export const ThreadInputTextarea = forwardRef<HTMLTextAreaElement, ThreadInputTextareaProps>(
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

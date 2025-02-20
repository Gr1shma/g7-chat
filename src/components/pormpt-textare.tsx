"use client";

import * as React from "react";
import { cn } from "~/lib/utils";

const PromptTextarea = React.forwardRef<
    HTMLTextAreaElement,
    React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        e.target.style.height = "48px";
        e.target.style.height = `${Math.min(e.target.scrollHeight, 240)}px`;
    };
    return (
        <textarea
            placeholder="Type your message here..."
            className={cn(
                "h-auto max-h-[240px] min-h-[48px] w-full resize-none overflow-y-auto bg-transparent text-base leading-6 text-neutral-100 outline-none disabled:opacity-0",
                className
            )}
            ref={ref}
            onInput={handleInput}
            {...props}
        />
    );
});

export { PromptTextarea };

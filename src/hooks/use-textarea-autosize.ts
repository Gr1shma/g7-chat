import { useCallback, useRef, useEffect } from "react";

export function useTextareaAutosize(initialValue = "") {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
        }
    }, []);

    const resetHeight = useCallback(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "48px";
        }
    }, []);

    useEffect(() => {
        adjustHeight();
    }, [adjustHeight, initialValue]);

    return { textareaRef, adjustHeight, resetHeight };
}

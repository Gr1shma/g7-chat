import type { UseChatHelpers } from "ai/react";

interface ThreadInputProps {
    threadId: UseChatHelpers["id"];
    input: UseChatHelpers["input"];
    setInput: UseChatHelpers["setInput"];
    isLoading: UseChatHelpers["isLoading"];
    stop: UseChatHelpers["stop"];
    handleSubmit: UseChatHelpers["handleSubmit"];
    status: UseChatHelpers["status"];
    setMessages: UseChatHelpers["setMessages"];
}

interface ThreadInputTextareaProps {
    input: UseChatHelpers["input"];
    setInput: UseChatHelpers["setInput"];
    isLoading: UseChatHelpers["isLoading"];
    onHeightChange: () => void;
    onSubmit: () => void;
}

interface InputToolbarProps {
    input: UseChatHelpers["input"];
    status: UseChatHelpers["status"];
    stop: UseChatHelpers["stop"];
    submitForm: () => void;
    setMessages: UseChatHelpers["setMessages"];
}

export type { ThreadInputProps, ThreadInputTextareaProps, InputToolbarProps }

import type { UseChatHelpers } from "ai/react";
import type { ValidModelString } from "~/lib/ai/providers";

interface ThreadInputProps {
    threadId: UseChatHelpers["id"];
    input: UseChatHelpers["input"];
    setInput: UseChatHelpers["setInput"];
    isLoading: UseChatHelpers["isLoading"];
    stop: UseChatHelpers["stop"];
    handleSubmit: UseChatHelpers["handleSubmit"];
    status: UseChatHelpers["status"];
    setMessages: UseChatHelpers["setMessages"];
    selectedModel: ValidModelString;
    onModelChange: (modelId: ValidModelString) => void;
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
    submitForm: () => void;
    selectedModel: ValidModelString;
    onModelChange: (modelId: ValidModelString) => void;
}

export type { ThreadInputProps, ThreadInputTextareaProps, InputToolbarProps };

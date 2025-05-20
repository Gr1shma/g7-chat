import type { Message } from "ai";
import type { UseChatHelpers } from "ai/react";

export interface ThreadMessagesProps {
    messages: Message[];
    initialMessageLength: number;
    append: UseChatHelpers["append"];
}

import type { Message, UseChatHelpers } from "ai/react";
import type React from "react";

interface SharedRefs {
    userRef: React.RefObject<HTMLDivElement>;
    assistantSpaceRef: React.RefObject<HTMLDivElement>;
}

interface WithChatHelpers {
    append: UseChatHelpers["append"];
}

export interface MessageItemProps extends SharedRefs, WithChatHelpers {
    message: Message;
    index: number;
    latestUserIndex?: number;
    nextAssistantIndex: number;
    showAssistantSpace: boolean;
    isNotFirstUserMessage: boolean;
}

export interface UserMessageItemProps extends SharedRefs, WithChatHelpers {
    message: Message;
    isLatestUser: boolean;
    isNotFirstUserMessage: boolean;
    showAssistantSpace: boolean;
}

export interface AnimationAndSpaceProps {
    assistantSpaceRef: React.RefObject<HTMLDivElement>;
}

export interface ControlUserMessageProps extends WithChatHelpers {
    message: Message;
    onEdit: () => void;
    isEditing?: boolean;
}

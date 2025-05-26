import { Copy, RefreshCcw, SquarePen } from "lucide-react";
import { Markdown } from "~/components/markdown";
import { Button } from "~/components/ui/button";
import { useToast } from "~/hooks/use-toast";
import { useState, useCallback, type KeyboardEvent, useEffect } from "react";
import { useTextareaAutosize } from "~/hooks/use-textarea-autosize";

import type {
    MessageItemProps,
    UserMessageItemProps,
    AnimationAndSpaceProps,
    ControlUserMessageProps,
} from "./thread-messages.types";

export default function MessageItem({
    message,
    index,
    latestUserIndex,
    nextAssistantIndex,
    userRef,
    assistantSpaceRef,
    showAssistantSpace,
    isNotFirstUserMessage,
    append,
}: MessageItemProps) {
    const isLatestUser = index === latestUserIndex;
    const isNextAssistant = index === nextAssistantIndex;

    if (message.role === "user") {
        return (
            <UserMessageItem
                userRef={userRef}
                isLatestUser={isLatestUser}
                append={append}
                message={message}
                isNotFirstUserMessage={isNotFirstUserMessage}
                showAssistantSpace={showAssistantSpace}
                assistantSpaceRef={assistantSpaceRef}
            />
        );
    }
    return (
        <div
            className={`mb-11 flex justify-start ${
                isNextAssistant ? "min-h-[calc(100vh-20rem)]" : ""
            }`}
        >
            <div className="group relative w-full max-w-full break-words">
                <Markdown>{message.content}</Markdown>
            </div>
        </div>
    );
}

function UserMessageItem({
    message,
    userRef,
    isLatestUser,
    isNotFirstUserMessage,
    showAssistantSpace,
    assistantSpaceRef,
    append,
}: UserMessageItemProps) {
    const [isEditing, setIsEditing] = useState<string | null>(null);

    return (
        <>
            <div
                ref={isLatestUser ? userRef : null}
                className="flex justify-end"
            >
                <div className="group relative inline-block max-w-[80%] break-words rounded-2xl bg-[#2D2D2D] p-4 text-left">
                    <span className="sr-only">Your message:</span>
                    {isEditing === message.content ? (
                        <EditMessageForm
                            initialContent={message.content}
                            onSave={(newContent) => {
                                setIsEditing(null);
                                append({
                                    role: "user",
                                    content: newContent,
                                });
                            }}
                            onCancel={() => setIsEditing(null)}
                        />
                    ) : (
                        message.content
                    )}
                    <ControlUserMessage
                        append={append}
                        message={message}
                        onEdit={() => setIsEditing(message.content)}
                        isEditing={isEditing === message.content}
                    />
                </div>
            </div>
            {isLatestUser && showAssistantSpace && isNotFirstUserMessage && (
                <AnimationAndSpace assistantSpaceRef={assistantSpaceRef} />
            )}
        </>
    );
}

function EditMessageForm({
    initialContent,
    onSave,
    onCancel,
}: {
    initialContent: string;
    onSave: (content: string) => void;
    onCancel: () => void;
}) {
    const [content, setContent] = useState(initialContent);
    const { textareaRef, adjustHeight } = useTextareaAutosize(initialContent);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.selectionStart =
                textareaRef.current.value.length;
        }
    }, [textareaRef]);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSave(content);
            } else if (e.key === "Escape") {
                e.preventDefault();
                onCancel();
            }
        },
        [content, onSave, onCancel]
    );

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setContent(e.target.value);
            adjustHeight();
        },
        [adjustHeight]
    );

    return (
        <div className="max-h-[256px] w-full overflow-y-scroll">
            <textarea
                ref={textareaRef}
                value={content}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="mb-px size-full resize-none border-none bg-transparent px-0 pt-[3px] !text-base leading-6 text-secondary-foreground shadow-none outline-none [vertical-align:unset] focus-visible:ring-0"
                rows={Math.max(1, initialContent.split("\n").length)}
                placeholder="Edit your message..."
            />
        </div>
    );
}

function AnimationAndSpace({ assistantSpaceRef }: AnimationAndSpaceProps) {
    return (
        <div
            ref={assistantSpaceRef}
            className="mb-10 h-[calc(100vh-20rem)] w-full"
            aria-hidden="true"
        >
            <div className="rounded-2xl px-4 py-2">
                <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-secondary-foreground/40 [animation-delay:-0.3s]" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-secondary-foreground/40 [animation-delay:-0.15s]" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-secondary-foreground/40" />
                </div>
            </div>
        </div>
    );
}

function ControlUserMessage({
    message,
    append,
    onEdit,
    isEditing = false,
}: ControlUserMessageProps & {
    onEdit: () => void;
    isEditing?: boolean;
}) {
    const { toast } = useToast();

    const handleResend = () => {
        append({
            role: "user",
            content: message.content,
        });
    };

    const handleEdit = () => {
        onEdit();
    };

    if (isEditing) {
        return null;
    }

    return (
        <div className="absolute right-0 mt-5 flex items-center gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 group-focus:opacity-100">
            <Button
                className="h-8 w-8 rounded-lg p-0 text-xs"
                variant="ghost"
                onClick={handleResend}
            >
                <RefreshCcw className="size-4" />
            </Button>
            <Button
                className="h-8 w-8 rounded-lg p-0 text-xs"
                variant="ghost"
                onClick={handleEdit}
            >
                <SquarePen className="size-4" />
            </Button>
            <Button
                className="h-8 w-8 rounded-lg p-0 text-xs"
                variant="ghost"
                onClick={() => {
                    navigator.clipboard.writeText(message.content);
                    toast({
                        description: "Copied to clipboard",
                    });
                }}
            >
                <Copy className="size-4" />
            </Button>
        </div>
    );
}

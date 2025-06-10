import { Copy, GitBranch, Loader2, RefreshCcw, SquarePen } from "lucide-react";
import { useState, useCallback, type KeyboardEvent, useEffect } from "react";
import { type Message } from "ai";
import { type UseChatHelpers } from "ai/react";

import { Markdown } from "~/components/markdown";
import { Button } from "~/components/ui/button";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "~/components/ui/dialog";
import { useToast } from "~/hooks/use-toast";
import { useTextareaAutosize } from "~/hooks/use-textarea-autosize";
import { api } from "~/trpc/react";

interface MessageItemProps {
    message: Message;
    messages: Message[];
    index: number;
    latestUserIndex?: number;
    nextAssistantIndex: number;
    showAssistantSpace: boolean;
    isNotFirstUserMessage: boolean;
    userRef: React.RefObject<HTMLDivElement>;
    assistantSpaceRef: React.RefObject<HTMLDivElement>;
    append: UseChatHelpers["append"];
}

export function MessageItem({
    message,
    messages,
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
                messages={messages}
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
        <>
            <div
                className={`mb-11 flex justify-start ${
                    isNextAssistant ? "min-h-[calc(100vh-20rem)]" : ""
                }`}
            >
                <div className="group relative w-full max-w-full break-words">
                    <Markdown>{message.content}</Markdown>
                    <div className="absolute left-0 -ml-0.5 mt-2 flex w-full flex-row justify-start gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 group-focus:opacity-100">
                        <div className="flex w-full flex-row justify-between gap-1 sm:w-auto">
                            <div className="flex items-center gap-1">
                                <ControlAssistantMessage
                                    append={append}
                                    message={message}
                                    userMessage={messages[index - 1]}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export interface UserMessageItemProps {
    message: Message;
    messages: Message[];
    isLatestUser: boolean;
    isNotFirstUserMessage: boolean;
    showAssistantSpace: boolean;
    userRef: React.RefObject<HTMLDivElement>;
    assistantSpaceRef: React.RefObject<HTMLDivElement>;
    append: UseChatHelpers["append"];
}

function UserMessageItem({
    message,
    messages,
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
                        <Markdown>{message.content}</Markdown>
                    )}
                    <ControlUserMessage
                        append={append}
                        message={message}
                        onEdit={() => setIsEditing(message.content)}
                        isEditing={isEditing === message.content}
                    />
                </div>
            </div>
            {isNotFirstUserMessage === false && messages.length === 1 && (
                <div className="mb-10 w-full" aria-hidden="true">
                    <div className="rounded-2xl px-4 py-2">
                        <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 animate-bounce rounded-full bg-secondary-foreground/40 [animation-delay:-0.3s]" />
                            <div className="h-2 w-2 animate-bounce rounded-full bg-secondary-foreground/40 [animation-delay:-0.15s]" />
                            <div className="h-2 w-2 animate-bounce rounded-full bg-secondary-foreground/40" />
                        </div>
                    </div>
                </div>
            )}
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

export interface AnimationAndSpaceProps {
    assistantSpaceRef: React.RefObject<HTMLDivElement>;
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

interface ControlUserMessageProps {
    message: Message;
    onEdit: () => void;
    isEditing?: boolean;
    append: UseChatHelpers["append"];
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
    const [isHidden, setIsHidden] = useState(false);

    const handleResend = () => {
        setIsHidden(true);
        append({
            role: "user",
            content: message.content,
        });
        setTimeout(() => setIsHidden(false), 300);
    };

    const handleEdit = () => {
        setIsHidden(true);
        onEdit();
        setTimeout(() => setIsHidden(false), 300);
    };

    const handleCopy = () => {
        setIsHidden(true);
        navigator.clipboard.writeText(message.content);
        toast({
            description: "Copied to clipboard",
        });
        setTimeout(() => setIsHidden(false), 300);
    };

    if (isEditing) {
        return null;
    }

    return (
        <div
            className={`absolute right-0 mt-5 flex items-center gap-1 transition-opacity ${
                isHidden
                    ? "opacity-0"
                    : "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 group-focus:opacity-100"
            }`}
        >
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
                onClick={handleCopy}
            >
                <Copy className="size-4" />
            </Button>
        </div>
    );
}

export function ControlAssistantMessage({
    message,
    append,
    userMessage,
}: {
    message: Message;
    append: UseChatHelpers["append"];
    userMessage: Message | undefined;
}) {
    const { toast } = useToast();
    const [isHidden, setIsHidden] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const utils = api.useUtils();
    const branchMutation = api.thread.branchOfByMessageId.useMutation({
        onSuccess: async () => {
            await utils.thread.getInfiniteThreads.invalidate();
            await utils.project.getAllProjects.invalidate();
            toast({
                description: "Branched to a new thread.",
            });
            setIsDialogOpen(false);
        },
        onError: () => {
            toast({
                variant: "destructive",
                description: "Failed to branch the thread.",
            });
        },
    });

    const handleResend = () => {
        if (!userMessage) return;
        setIsHidden(true);
        append({
            role: "user",
            content: userMessage.content,
        });
        setTimeout(() => setIsHidden(false), 300);
    };

    const handleCopy = () => {
        setIsHidden(true);
        navigator.clipboard.writeText(message.content);
        toast({
            description: "Copied to clipboard",
        });
        setTimeout(() => setIsHidden(false), 300);
    };

    const handleConfirmBranch = () => {
        branchMutation.mutate({ messageId: message.id });
    };

    return (
        <>
            <div
                className={`flex items-center gap-1 transition-opacity ${
                    isHidden ? "opacity-0" : ""
                }`}
            >
                <Button
                    className="h-8 w-8 rounded-lg p-0 text-xs"
                    variant="ghost"
                    onClick={handleResend}
                    disabled={!userMessage}
                >
                    <RefreshCcw className="size-4" />
                </Button>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            className="h-8 w-8 rounded-lg p-0 text-xs"
                            variant="ghost"
                        >
                            <GitBranch className="size-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Branch Thread?</DialogTitle>
                        </DialogHeader>
                        <p className="text-sm text-muted-foreground">
                            Are you sure you want to create a new branch from
                            this message?
                        </p>
                        <DialogFooter className="mt-4">
                            <Button
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleConfirmBranch}
                                disabled={branchMutation.isPending}
                            >
                                {branchMutation.isPending ? (
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                ) : null}
                                Confirm
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Button
                    className="h-8 w-8 rounded-lg p-0 text-xs"
                    variant="ghost"
                    onClick={handleCopy}
                >
                    <Copy className="size-4" />
                </Button>
            </div>
        </>
    );
}

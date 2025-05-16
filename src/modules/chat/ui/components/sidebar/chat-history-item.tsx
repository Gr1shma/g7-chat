"use client";

import type { DB_CHAT_TYPE } from "~/server/db/schema";
import Link from "next/link";
import { memo, useState, useRef, useEffect } from "react";
import { SidebarMenuItem, SidebarMenuButton } from "~/components/ui/sidebar";
import { PinIcon, TrashIcon, CheckIcon, XIcon, PinOffIcon } from "lucide-react";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";

const PureChatItem = ({
    chat,
    isActive,
    setOpenMobile,
}: {
    chat: DB_CHAT_TYPE;
    isActive: boolean;
    setOpenMobile: (open: boolean) => void;
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(chat.title);
    const inputRef = useRef<HTMLInputElement>(null);

    const utils = api.useUtils();
    const input = { limit: 20 };

    const changeTitle = api.chat.changeTitle.useMutation({
        onMutate: async ({ chatId, title }) => {
            await utils.chat.getInfiniteChats.cancel(input);

            const prevData = utils.chat.getInfiniteChats.getInfiniteData(input);

            utils.chat.getInfiniteChats.setInfiniteData(input, (oldData) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    pages: oldData.pages.map((page) => ({
                        ...page,
                        items: page.items.map((chat) =>
                            chat.id === chatId ? { ...chat, title } : chat
                        ),
                    })),
                };
            });

            return { prevData };
        },
        onError: (_err, _variables, context) => {
            if (context?.prevData) {
                utils.chat.getInfiniteChats.setInfiniteData(
                    input,
                    context.prevData
                );
            }
        },
        onSettled: () => {
            utils.chat.getInfiniteChats.invalidate(input);
        },
    });

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleTitleClick = (e: React.MouseEvent) => {
        if (!isActive) return;
        e.preventDefault();
        setIsEditing(true);
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
    };
    const handleTitleSave = async () => {
        const trimmedTitle = title.trim();
        if (trimmedTitle === "") {
            setTitle(chat.title);
            setIsEditing(false);
            return;
        }
        if (trimmedTitle === chat.title) {
            setIsEditing(false);
            return;
        }
        try {
            await changeTitle.mutateAsync({
                chatId: chat.id,
                title: trimmedTitle,
            });
        } catch (error) {
            setTitle(chat.title);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleTitleSave();
        } else if (e.key === "Escape") {
            setTitle(chat.title);
            setIsEditing(false);
        }
    };

    const togglePin = api.chat.tooglePinById.useMutation({
        onMutate: async (chatId: string) => {
            await utils.chat.getInfiniteChats.cancel(input);
            const prevData = utils.chat.getInfiniteChats.getInfiniteData(input);

            utils.chat.getInfiniteChats.setInfiniteData(input, (oldData) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    pages: oldData.pages.map((page) => ({
                        ...page,
                        items: page.items.map((c) =>
                            c.id === chatId
                                ? { ...c, isPinned: !c.isPinned }
                                : c
                        ),
                    })),
                };
            });

            return { prevData };
        },
        onError: (_err, chatId, context) => {
            toast.error("Failed to pin chat");
            if (context?.prevData) {
                utils.chat.getInfiniteChats.setInfiniteData(
                    input,
                    context.prevData
                );
            }
        },
        onSettled: () => {
            utils.chat.getInfiniteChats.invalidate(input);
        },
    });

    const deleteChat = api.chat.deleteById.useMutation({
        onMutate: async (chatId) => {
            await utils.chat.getInfiniteChats.cancel(input);
            const prevData = utils.chat.getInfiniteChats.getInfiniteData(input);

            utils.chat.getInfiniteChats.setInfiniteData(input, (oldData) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    pages: oldData.pages.map((page) => ({
                        ...page,
                        items: page.items.filter((chat) => chat.id !== chatId),
                    })),
                };
            });

            return { prevData };
        },
        onError: (error, _variables, context) => {
            toast.error("Failed to delete chat");
            if (context?.prevData) {
                utils.chat.getInfiniteChats.setInfiniteData(
                    input,
                    context.prevData
                );
            }
        },
        onSuccess: () => {
            toast.success("Chat deleted");
        },
        onSettled: () => {
            utils.chat.getInfiniteChats.invalidate(input);
        },
    });
    const router = useRouter();

    const handleDelete = async () => {
        try {
            await deleteChat.mutateAsync(chat.id);
            if (isActive) {
                router.push("/chat");
            }
        } catch {
            toast("Deletion failed");
        }
    };

    const [open, setOpen] = useState(false);

    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive}>
                {!isEditing ? (
                    <div className="group/link relative flex w-full items-center">
                        <Link
                            href={`/chat/${chat.id}`}
                            onClick={() => setOpenMobile(false)}
                            className="w-full text-left"
                        >
                            <span
                                className="block overflow-hidden truncate px-1 py-1 text-sm hover:cursor-pointer"
                                title={chat.title}
                                onDoubleClick={handleTitleClick}
                            >
                                {title}
                            </span>
                        </Link>

                        <div className="pointer-events-auto absolute -right-1 bottom-0 top-0 z-50 flex translate-x-full items-center justify-end pr-1 text-muted-foreground transition-transform group-hover/link:translate-x-0 group-hover/link:bg-sidebar-accent">
                            <div className="pointer-events-none absolute bottom-0 right-[100%] top-0 h-12 w-8 bg-gradient-to-l from-sidebar-accent to-transparent opacity-0 group-hover/link:opacity-100" />
                            <Button
                                variant="ghost"
                                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted/40"
                                tabIndex={-1}
                                aria-label="Pin chat"
                                onClick={() => togglePin.mutate(chat.id)}
                            >
                                {chat.isPinned ? (
                                    <PinOffIcon className="size-4" />
                                ) : (
                                    <PinIcon className="size-4" />
                                )}
                            </Button>

                            <AlertDialog open={open} onOpenChange={setOpen}>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="rounded-md p-1.5 text-destructive hover:bg-destructive/50 hover:text-destructive-foreground"
                                        tabIndex={-1}
                                        aria-label="Delete chat"
                                    >
                                        <TrashIcon className="size-4" />
                                    </Button>
                                </AlertDialogTrigger>

                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Are you absolutely sure?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This
                                            will permanently delete this chat
                                            and all its messages.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={async () => {
                                                try {
                                                    handleDelete();
                                                    setOpen(false);
                                                } catch (error) {
                                                    toast(
                                                        "Error while handling delete"
                                                    );
                                                }
                                            }}
                                        >
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                ) : (
                    <div className="relative flex w-full items-center px-1">
                        <Input
                            ref={inputRef}
                            value={title}
                            onChange={handleTitleChange}
                            onKeyDown={handleKeyDown}
                            onBlur={handleTitleSave}
                            className="h-7 w-full bg-sidebar-accent text-sm"
                            aria-label="Edit chat title"
                        />
                        <div className="absolute right-2 flex space-x-1">
                            <button
                                onClick={handleTitleSave}
                                className="rounded-sm p-1 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                aria-label="Save title"
                            >
                                <CheckIcon className="size-3.5" />
                            </button>
                            <button
                                onClick={() => {
                                    setTitle(chat.title);
                                    setIsEditing(false);
                                }}
                                className="rounded-sm p-1 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                aria-label="Cancel editing"
                            >
                                <XIcon className="size-3.5" />
                            </button>
                        </div>
                    </div>
                )}
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
};

export const ChatItem = memo(PureChatItem, (prevProps, nextProps) => {
    if (prevProps.isActive !== nextProps.isActive) return false;
    if (prevProps.chat.title !== nextProps.chat.title) return false;
    return true;
});

"use client"

import type { DB_CHAT_TYPE } from "~/server/db/schema"
import Link from "next/link"
import { memo, useState, useRef, useEffect } from "react"
import { SidebarMenuItem, SidebarMenuButton } from "~/components/ui/sidebar"
import { PinIcon, TrashIcon, CheckIcon, XIcon } from 'lucide-react'
import { Input } from "~/components/ui/input"
import { api } from "~/trpc/react"

const PureChatItem = ({
    chat,
    isActive,
    setOpenMobile,
}: {
    chat: DB_CHAT_TYPE
    isActive: boolean
    setOpenMobile: (open: boolean) => void
}) => {
    const [isEditing, setIsEditing] = useState(false)
    const [title, setTitle] = useState(chat.title)
    const inputRef = useRef<HTMLInputElement>(null)


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
                    pages: oldData.pages.map(page => ({
                        ...page,
                        items: page.items.map(chat =>
                            chat.id === chatId ? { ...chat, title } : chat
                        ),
                    })),
                };
            });

            return { prevData };
        },
        onError: (_err, _variables, context) => {
            if (context?.prevData) {
                utils.chat.getInfiniteChats.setInfiniteData(input, context.prevData);
            }
        },
        onSettled: () => {
            utils.chat.getInfiniteChats.invalidate(input);
        },
    });


    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus()
            inputRef.current.select()
        }
    }, [isEditing])

    const handleTitleClick = (e: React.MouseEvent) => {
        if (!isActive) return
        e.preventDefault()
        setIsEditing(true)
    }

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value)
    }
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
            await changeTitle.mutateAsync({ chatId: chat.id, title: trimmedTitle });
        } catch (error) {
            console.error("Failed to update title:", error);
            setTitle(chat.title);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleTitleSave()
        } else if (e.key === "Escape") {
            setTitle(chat.title)
            setIsEditing(false)
        }
    }

    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive}>
                {!isEditing ? (
                    <Link href={`/chat/${chat.id}`} onClick={() => setOpenMobile(false)} className="group/link">
                        <div className="relative flex w-full items-center">
                            <button
                                className="w-full text-left"
                                onDoubleClick={handleTitleClick}
                            >
                                <span
                                    className="block overflow-hidden truncate px-1 py-1 text-sm hover:cursor-pointer"
                                    title={chat.title}
                                >
                                    {title}
                                </span>
                            </button>
                            <div className="pointer-events-auto absolute -right-1 bottom-0 top-0 z-50 flex items-center justify-end text-muted-foreground opacity-0 transition-opacity group-hover/link:opacity-100">
                                <div className="flex space-x-0.5">
                                    <button
                                        className="rounded-sm p-1.5 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                        tabIndex={-1}
                                        aria-label="Pin chat"
                                    >
                                        <PinIcon className="size-4" />
                                    </button>
                                    <button
                                        className="rounded-sm p-1.5 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                        tabIndex={-1}
                                        aria-label="Delete chat"
                                    >
                                        <TrashIcon className="size-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Link>
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
                                    setTitle(chat.title)
                                    setIsEditing(false)
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
    )
}

export const ChatItem = memo(PureChatItem, (prevProps, nextProps) => {
    if (prevProps.isActive !== nextProps.isActive) return false;
    if (prevProps.chat.title !== nextProps.chat.title) return false;
    return true;
});

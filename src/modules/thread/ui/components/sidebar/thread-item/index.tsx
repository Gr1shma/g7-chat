"use client";

import Link from "next/link";
import { memo, useState, useRef, useEffect } from "react";
import { SidebarMenuButton } from "~/components/ui/sidebar";
import { CheckIcon, XIcon } from "lucide-react";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";

import { type ThreadItemProps } from "../thread-sidebar.types";
import { PinThreadButton } from "./pin-thread-button";
import { ThreadDropDownButton } from "./thread-dropdown-button";

const input = { limit: 20 };

const PureThreadItem = ({
    thread,
    isActive,
    setOpenMobile,
    isProjectItem,
}: ThreadItemProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(thread.title);
    const inputRef = useRef<HTMLInputElement>(null);

    const utils = api.useUtils();

    const changeTitle = api.thread.changeThreadTitle.useMutation({
        onMutate: async ({ threadId, title }) => {
            await utils.thread.getInfiniteThreads.cancel(input);

            const prevData =
                utils.thread.getInfiniteThreads.getInfiniteData(input);

            utils.thread.getInfiniteThreads.setInfiniteData(
                input,
                (oldData) => {
                    if (!oldData) return oldData;
                    return {
                        ...oldData,
                        pages: oldData.pages.map((page) => ({
                            ...page,
                            items: page.items.map((thread) =>
                                thread.id === threadId
                                    ? { ...thread, title }
                                    : thread
                            ),
                        })),
                    };
                }
            );

            return { prevData };
        },
        onError: (_err, _variables, context) => {
            if (context?.prevData) {
                utils.thread.getInfiniteThreads.setInfiniteData(
                    input,
                    context.prevData
                );
            }
        },
        onSettled: () => {
            utils.thread.getInfiniteThreads.invalidate(input);
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
            setTitle(thread.title);
            setIsEditing(false);
            return;
        }
        if (trimmedTitle === thread.title) {
            setIsEditing(false);
            return;
        }
        try {
            await changeTitle.mutateAsync({
                threadId: thread.id,
                title: trimmedTitle,
            });
        } catch (error) {
            setTitle(thread.title);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleTitleSave();
        } else if (e.key === "Escape") {
            setTitle(thread.title);
            setIsEditing(false);
        }
    };

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    return (
        <SidebarMenuButton
            asChild
            isActive={isActive}
            className="hover:bg-transparent data-[active=true]:bg-sidebar-accent"
        >
            {!isEditing ? (
                <div className="group/link relative flex w-full items-center overflow-hidden">
                    <Link
                        href={`/chat/${thread.id}`}
                        onClick={() => setOpenMobile(false)}
                        className="min-w-0 flex-1 text-left transition-all duration-200"
                    >
                        <span
                            className="block overflow-hidden truncate px-1 py-1 text-sm hover:cursor-pointer"
                            title={thread.title}
                            onDoubleClick={handleTitleClick}
                        >
                            {title}
                        </span>
                    </Link>
                    <div
                        className={`flex-shrink-0 transition-all duration-200 ${
                            isActive || isDropdownOpen
                                ? "w-16 opacity-100"
                                : "w-0 opacity-0 group-hover/link:w-16 group-hover/link:opacity-100"
                        }`}
                    >
                        <div className="relative flex h-full items-center justify-end pr-1 text-muted-foreground">
                            <div
                                className={`pointer-events-none absolute bottom-0 right-full top-0 w-8 bg-gradient-to-l from-sidebar-accent to-transparent transition-opacity duration-200 ${
                                    isActive ? "opacity-100" : "opacity-0"
                                }`}
                            />
                            {isProjectItem ? null : (
                                <PinThreadButton thread={thread} />
                            )}
                            <ThreadDropDownButton
                                thread={thread}
                                onOpenChange={setIsDropdownOpen}
                                isActive={isActive}
                            />
                        </div>
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
                        aria-label="Edit thread title"
                    />
                    <div className="absolute right-2 flex space-x-0.5">
                        <button
                            onClick={handleTitleSave}
                            className="rounded-sm bg-muted/80 p-1 hover:bg-muted hover:text-sidebar-accent-foreground"
                            aria-label="Save title"
                        >
                            <CheckIcon className="size-3.5" />
                        </button>
                        <button
                            onClick={() => {
                                setTitle(thread.title);
                                setIsEditing(false);
                            }}
                            className="rounded-sm bg-muted/80 p-1 hover:bg-muted hover:text-sidebar-accent-foreground"
                            aria-label="Cancel editing"
                        >
                            <XIcon className="size-3.5" />
                        </button>
                    </div>
                </div>
            )}
        </SidebarMenuButton>
    );
};

export const ThreadItem = memo(PureThreadItem, (prevProps, nextProps) => {
    if (prevProps.isActive !== nextProps.isActive) return false;
    if (prevProps.thread.title !== nextProps.thread.title) return false;
    return true;
});

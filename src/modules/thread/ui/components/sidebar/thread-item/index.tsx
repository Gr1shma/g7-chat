"use client";

import Link from "next/link";
import { memo, useState, useRef, useEffect } from "react";
import { CheckIcon, GitBranch, XIcon } from "lucide-react";

import { SidebarMenuButton } from "~/components/ui/sidebar";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";
import { PinThreadButton } from "./pin-thread-button";
import { ThreadDropDownButton } from "./thread-dropdown-button";
import { Button } from "~/components/ui/button";
import { type DB_THREAD_TYPE } from "~/server/db/schema";
import { type ProjectWithThreads } from "../thread-sidebar-group";
import { cn } from "~/lib/utils";

export interface ThreadItemProps {
    thread: DB_THREAD_TYPE;
    isActive: boolean;
    setOpenMobile: (open: boolean) => void;
    isProjectItem: boolean;
    projectWithThreads: ProjectWithThreads[];
    onThreadSelect?: (thread: DB_THREAD_TYPE) => void;
}

const input = { limit: 20 };

const PureThreadItem = ({
    thread,
    isActive,
    setOpenMobile,
    isProjectItem,
    projectWithThreads,
    onThreadSelect,
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

    const handleTitleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsEditing(true);
    };

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

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

    const handleLinkClick = (e: React.MouseEvent) => {
        if (onThreadSelect) {
            e.preventDefault();
            setOpenMobile(false);
            onThreadSelect(thread);
        } else {
            setOpenMobile(false);
        }
    };

    return (
        <SidebarMenuButton
            asChild
            isActive={isActive}
            className="transition-colors duration-200 hover:bg-transparent data-[active=true]:bg-sidebar-accent"
        >
            {!isEditing ? (
                <div
                    className={`group/link relative flex w-full cursor-pointer items-center justify-between rounded-md px-2 py-1 text-sm transition-colors hover:bg-muted ${isActive ? "bg-accent text-accent-foreground" : ""} `}
                >
                    <Link
                        href={`/chat/${thread.id}`}
                        onClick={handleLinkClick}
                        onDoubleClick={handleTitleClick}
                        className="flex min-w-0 flex-1 items-center gap-1"
                    >
                        {thread.isBranched && (
                            <GitBranch className="h-4 w-4 shrink-0 text-muted-foreground" />
                        )}
                        <span className="truncate">{thread.title}</span>
                    </Link>

                    <div
                        className={cn(
                            "ml-2 flex items-center gap-1 transition-all duration-200",
                            isActive || isDropdownOpen
                                ? "opacity-100"
                                : "opacity-0 group-hover/link:opacity-100"
                        )}
                    >
                        {!isProjectItem && <PinThreadButton thread={thread} />}
                        <ThreadDropDownButton
                            thread={thread}
                            onOpenChange={setIsDropdownOpen}
                            isActive={isActive}
                            projectWithThreads={projectWithThreads}
                        />
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
                        className="h-7 w-full bg-sidebar-accent pr-20 text-sm"
                        aria-label="Edit thread title"
                    />
                    <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center space-x-0.5">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleTitleSave}
                            className="h-5 w-5 p-0"
                            aria-label="Save title"
                        >
                            <CheckIcon className="h-3 w-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setTitle(thread.title);
                                setIsEditing(false);
                            }}
                            className="h-5 w-5 p-0"
                            aria-label="Cancel editing"
                        >
                            <XIcon className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
            )}
        </SidebarMenuButton>
    );
};

export const ThreadItem = memo(PureThreadItem, (prevProps, nextProps) => {
    if (prevProps.isActive !== nextProps.isActive) return false;
    if (prevProps.thread.title !== nextProps.thread.title) return false;
    if (prevProps.thread.id !== nextProps.thread.id) return false;
    return true;
});

"use client";

import { isToday, isYesterday, subMonths, subWeeks } from "date-fns";
import { useParams } from "next/navigation";
import type { User } from "next-auth";

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    useSidebar,
} from "~/components/ui/sidebar";

import { type DB_CHAT_TYPE } from "~/server/db/schema";
import { ChatItem } from "./chat-history-item";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/trpc/react";
import { InfinitScroll } from "~/components/infinite-scroll";

type GroupedChats = {
    pinned: DB_CHAT_TYPE[];
    today: DB_CHAT_TYPE[];
    yesterday: DB_CHAT_TYPE[];
    lastWeek: DB_CHAT_TYPE[];
    lastMonth: DB_CHAT_TYPE[];
    older: DB_CHAT_TYPE[];
};

export interface ChatHistory {
    chats: DB_CHAT_TYPE[];
    hasMore: boolean;
}

const groupChatsByDate = (chats: DB_CHAT_TYPE[]): GroupedChats => {
    const now = new Date();
    const oneWeekAgo = subWeeks(now, 1);
    const oneMonthAgo = subMonths(now, 1);

    return chats.reduce(
        (groups, chat) => {
            const chatDate = new Date(chat.createdAt);
            if (chat.isPinned === true) {
                groups.pinned.push(chat);
            } else if (isToday(chatDate)) {
                groups.today.push(chat);
            } else if (isYesterday(chatDate)) {
                groups.yesterday.push(chat);
            } else if (chatDate > oneWeekAgo) {
                groups.lastWeek.push(chat);
            } else if (chatDate > oneMonthAgo) {
                groups.lastMonth.push(chat);
            } else {
                groups.older.push(chat);
            }

            return groups;
        },
        {
            pinned: [],
            today: [],
            yesterday: [],
            lastWeek: [],
            lastMonth: [],
            older: [],
        } as GroupedChats
    );
};

export function SidebarHistory({ user }: { user: User | undefined }) {
    const { setOpenMobile } = useSidebar();
    const { chatId } = useParams();

    const [data, query] = api.chat.getInfiniteChats.useSuspenseInfiniteQuery(
        {
            limit: 20,
        },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        }
    );
    if (!user) {
        return (
            <SidebarGroup>
                <SidebarGroupContent>
                    <div className="flex w-full flex-row items-center justify-center gap-2 px-2 text-sm text-zinc-500">
                        Login to save and revisit previous chats!
                    </div>
                </SidebarGroupContent>
            </SidebarGroup>
        );
    }

    if (query.isLoading) {
        return (
            <SidebarGroup>
                <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                    Today
                </div>
                <SidebarGroupContent>
                    <div className="flex flex-col">
                        {[44, 32, 28, 64, 52].map((item) => (
                            <div
                                key={item}
                                className="flex h-8 items-center gap-2 rounded-md px-2"
                            >
                                <Skeleton
                                    className="h-4 max-w-[--skeleton-width] flex-1 rounded-md bg-sidebar-accent-foreground/10"
                                    style={
                                        {
                                            "--skeleton-width": `${item}%`,
                                        } as React.CSSProperties
                                    }
                                />
                            </div>
                        ))}
                    </div>
                </SidebarGroupContent>
            </SidebarGroup>
        );
    }

    if (query.isError) {
        return (
            <SidebarGroup>
                <SidebarGroupContent>
                    <div className="flex w-full flex-row items-center justify-center gap-2 px-2 text-sm text-red-500">
                        Failed to load chat history.
                    </div>
                </SidebarGroupContent>
            </SidebarGroup>
        );
    }

    const allChats = data?.pages.flatMap((page) => page.items) ?? [];

    if (allChats.length === 0) {
        return (
            <SidebarGroup>
                <SidebarGroupContent>
                    <div className="flex w-full flex-row items-center justify-center gap-2 px-2 text-sm text-zinc-500">
                        Your conversations will appear here once you start
                        chatting!
                    </div>
                </SidebarGroupContent>
            </SidebarGroup>
        );
    }

    const groupedChats = groupChatsByDate(allChats);

    return (
        <SidebarGroup>
            <SidebarGroupContent>
                <SidebarMenu>
                    <div className="flex flex-col gap-6">
                        {Object.entries(groupedChats).map(([label, chats]) => {
                            if (chats.length === 0) return null;

                            const labelMap: Record<keyof GroupedChats, string> =
                                {
                                    pinned: "Pinned Chat",
                                    today: "Today",
                                    yesterday: "Yesterday",
                                    lastWeek: "Last 7 days",
                                    lastMonth: "Last 30 days",
                                    older: "Older than last month",
                                };

                            return (
                                <div key={label}>
                                    <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                                        {labelMap[label as keyof GroupedChats]}
                                    </div>
                                    {chats.map((chat) => (
                                        <ChatItem
                                            key={chat.id}
                                            chat={chat}
                                            isActive={chat.id === chatId}
                                            setOpenMobile={setOpenMobile}
                                        />
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </SidebarMenu>
                <InfinitScroll
                    hasNextPage={query.hasNextPage}
                    isFetchingNextPage={query.isFetchingNextPage}
                    fetchNextPage={query.fetchNextPage}
                />
            </SidebarGroupContent>
        </SidebarGroup>
    );
}

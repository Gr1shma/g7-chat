"use client";

import { isToday, isYesterday, subMonths, subWeeks } from "date-fns";
import { useParams } from "next/navigation";
import type { User } from "next-auth";
import useSWRInfinite from "swr/infinite";

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    useSidebar,
} from "~/components/ui/sidebar";

import { fetcher } from "~/lib/utils";
import { DB_CHAT_TYPE } from "~/server/db/schema";
import { ChatItem } from "./chat-history-item";
import { Skeleton } from "~/components/ui/skeleton";

type GroupedChats = {
    today: DB_CHAT_TYPE[];
    yesterday: DB_CHAT_TYPE[];
    lastWeek: DB_CHAT_TYPE[];
    lastMonth: DB_CHAT_TYPE[];
    older: DB_CHAT_TYPE[];
};

export interface ChatHistory {
    chats: Array<DB_CHAT_TYPE>;
    hasMore: boolean;
}

const groupChatsByDate = (chats: DB_CHAT_TYPE[]): GroupedChats => {
    const now = new Date();
    const oneWeekAgo = subWeeks(now, 1);
    const oneMonthAgo = subMonths(now, 1);

    return chats.reduce(
        (groups, chat) => {
            const chatDate = new Date(chat.createdAt);

            if (isToday(chatDate)) {
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
            today: [],
            yesterday: [],
            lastWeek: [],
            lastMonth: [],
            older: [],
        } as GroupedChats
    );
};

const PAGE_SIZE = 20;

export function getChatHistoryPaginationKey(
    pageIndex: number,
    previousPageData: ChatHistory
) {
    if (previousPageData && previousPageData.hasMore === false) {
        return null;
    }

    if (pageIndex === 0) return `/api/history?limit=${PAGE_SIZE}`;

    const firstChatFromPage = previousPageData.chats.at(-1);

    if (!firstChatFromPage) return null;

    return `/api/history?ending_before=${firstChatFromPage.id}&limit=${PAGE_SIZE}`;
}

export function SidebarHistory({ user }: { user: User | undefined }) {
    console.log("SidebarHistory rendered");
    const { setOpenMobile } = useSidebar();
    const { chatId } = useParams();

    const { data: paginatedChatHistories, isLoading } =
        useSWRInfinite<ChatHistory>(getChatHistoryPaginationKey, fetcher, {
            fallbackData: [],
            keepPreviousData: true,
            suspense: true,
        });

    const hasEmptyChatHistory = paginatedChatHistories
        ? paginatedChatHistories.every((page) => page.chats.length === 0)
        : false;

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

    if (isLoading) {
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

    if (hasEmptyChatHistory) {
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

    return (
        <>
            <SidebarGroup>
                <SidebarGroupContent>
                    <SidebarMenu>
                        {paginatedChatHistories &&
                            (() => {
                                const chatsFromHistory =
                                    paginatedChatHistories.flatMap(
                                        (paginatedChatHistory) =>
                                            paginatedChatHistory.chats
                                    );

                                const groupedChats =
                                    groupChatsByDate(chatsFromHistory);

                                return (
                                    <div className="flex flex-col gap-6">
                                        {groupedChats.today.length > 0 && (
                                            <div>
                                                <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                                                    Today
                                                </div>
                                                {groupedChats.today.map(
                                                    (chat) => (
                                                        <ChatItem
                                                            key={chat.id}
                                                            chat={chat}
                                                            isActive={
                                                                chat.id ===
                                                                chatId
                                                            }
                                                            setOpenMobile={
                                                                setOpenMobile
                                                            }
                                                        />
                                                    )
                                                )}
                                            </div>
                                        )}

                                        {groupedChats.yesterday.length > 0 && (
                                            <div>
                                                <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                                                    Yesterday
                                                </div>
                                                {groupedChats.yesterday.map(
                                                    (chat) => (
                                                        <ChatItem
                                                            key={chat.id}
                                                            chat={chat}
                                                            isActive={
                                                                chat.id ===
                                                                chatId
                                                            }
                                                            setOpenMobile={
                                                                setOpenMobile
                                                            }
                                                        />
                                                    )
                                                )}
                                            </div>
                                        )}

                                        {groupedChats.lastWeek.length > 0 && (
                                            <div>
                                                <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                                                    Last 7 days
                                                </div>
                                                {groupedChats.lastWeek.map(
                                                    (chat) => (
                                                        <ChatItem
                                                            key={chat.id}
                                                            chat={chat}
                                                            isActive={
                                                                chat.id ===
                                                                chatId
                                                            }
                                                            setOpenMobile={
                                                                setOpenMobile
                                                            }
                                                        />
                                                    )
                                                )}
                                            </div>
                                        )}

                                        {groupedChats.lastMonth.length > 0 && (
                                            <div>
                                                <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                                                    Last 30 days
                                                </div>
                                                {groupedChats.lastMonth.map(
                                                    (chat) => (
                                                        <ChatItem
                                                            key={chat.id}
                                                            chat={chat}
                                                            isActive={
                                                                chat.id ===
                                                                chatId
                                                            }
                                                            setOpenMobile={
                                                                setOpenMobile
                                                            }
                                                        />
                                                    )
                                                )}
                                            </div>
                                        )}

                                        {groupedChats.older.length > 0 && (
                                            <div>
                                                <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                                                    Older than last month
                                                </div>
                                                {groupedChats.older.map(
                                                    (chat) => (
                                                        <ChatItem
                                                            key={chat.id}
                                                            chat={chat}
                                                            isActive={
                                                                chat.id ===
                                                                chatId
                                                            }
                                                            setOpenMobile={
                                                                setOpenMobile
                                                            }
                                                        />
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </>
    );
}

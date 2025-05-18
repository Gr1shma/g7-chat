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

import { type DB_THREAD_TYPE } from "~/server/db/schema";
import { ThreadItem } from "./thread-sidebar-item";
import { api } from "~/trpc/react";
import { InfinitScroll } from "~/components/infinite-scroll";
import { Skeleton } from "~/components/ui/skeleton";

type GroupedThreads = {
    pinned: DB_THREAD_TYPE[];
    today: DB_THREAD_TYPE[];
    yesterday: DB_THREAD_TYPE[];
    lastWeek: DB_THREAD_TYPE[];
    lastMonth: DB_THREAD_TYPE[];
    older: DB_THREAD_TYPE[];
};

export interface ThreadHistory {
    threads: DB_THREAD_TYPE[];
    hasMore: boolean;
}

const groupThreadsByDate = (threads: DB_THREAD_TYPE[]): GroupedThreads => {
    const now = new Date();
    const oneWeekAgo = subWeeks(now, 1);
    const oneMonthAgo = subMonths(now, 1);

    return threads.reduce(
        (groups, thread) => {
            const threadDate = new Date(thread.createdAt);
            if (thread.isPinned === true) {
                groups.pinned.push(thread);
            } else if (isToday(threadDate)) {
                groups.today.push(thread);
            } else if (isYesterday(threadDate)) {
                groups.yesterday.push(thread);
            } else if (threadDate > oneWeekAgo) {
                groups.lastWeek.push(thread);
            } else if (threadDate > oneMonthAgo) {
                groups.lastMonth.push(thread);
            } else {
                groups.older.push(thread);
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
        } as GroupedThreads
    );
};

export function SidebarHistory({
    user,
    searchQuery,
}: {
    user: User | undefined;
    searchQuery: string;
}) {
    const { setOpenMobile } = useSidebar();
    const { threadId } = useParams();

    const [data, query] =
        api.thread.getInfiniteThreads.useSuspenseInfiniteQuery(
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
                        Login to save and revisit previous threads!
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
                        Failed to load thread history.
                    </div>
                </SidebarGroupContent>
            </SidebarGroup>
        );
    }

    const allThreads = data?.pages.flatMap((page) => page.items) ?? [];

    if (allThreads.length === 0) {
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

    const normalizedQuery = searchQuery.toLowerCase();

    const filteredThreads = allThreads.filter((thread) =>
        thread.title?.toLowerCase().includes(normalizedQuery)
    );

    const groupedThreads = groupThreadsByDate(filteredThreads);

    if (filteredThreads.length === 0) {
        return (
            <SidebarGroup>
                <SidebarGroupContent>
                    <div className="flex w-full flex-row items-center justify-center gap-2 px-2 text-sm text-zinc-500">
                        No threads found matching your search.
                    </div>
                </SidebarGroupContent>
            </SidebarGroup>
        );
    }

    return (
        <SidebarGroup>
            <SidebarGroupContent>
                <SidebarMenu>
                    <div className="flex flex-col gap-6">
                        {Object.entries(groupedThreads).map(
                            ([label, threads]) => {
                                if (threads.length === 0) return null;

                                const labelMap: Record<
                                    keyof GroupedThreads,
                                    string
                                > = {
                                    pinned: "Pinned Thread",
                                    today: "Today",
                                    yesterday: "Yesterday",
                                    lastWeek: "Last 7 days",
                                    lastMonth: "Last 30 days",
                                    older: "Older than last month",
                                };

                                return (
                                    <div key={label}>
                                        <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                                            {
                                                labelMap[
                                                    label as keyof GroupedThreads
                                                ]
                                            }
                                        </div>
                                        {threads.map((thread) => (
                                            <ThreadItem
                                                key={thread.id}
                                                thread={thread}
                                                isActive={
                                                    thread.id === threadId
                                                }
                                                setOpenMobile={setOpenMobile}
                                            />
                                        ))}
                                    </div>
                                );
                            }
                        )}
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

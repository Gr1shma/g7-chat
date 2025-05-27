"use client";

import { useParams } from "next/navigation";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    useSidebar,
} from "~/components/ui/sidebar";

import { ThreadItem } from "./thread-sidebar-item";
import { api } from "~/trpc/react";
import { InfinitScroll } from "~/components/infinite-scroll";
import { Skeleton } from "~/components/ui/skeleton";
import { type SidebarHistoryProps } from "./thread-sidebar.types";
import { groupThreadsByDate } from "./thread-sidebar.utils";
import { useSession } from "next-auth/react";

export default function SidebarSection({ searchQuery }: SidebarHistoryProps) {
    return (
        <Suspense fallback={<p>Loading</p>}>
            <ErrorBoundary fallback={<p>Error</p>}>
                <SidebarHistory searchQuery={searchQuery} />
            </ErrorBoundary>
        </Suspense>
    );
}

function SidebarHistory({ searchQuery }: SidebarHistoryProps) {
    const session = useSession();
    const { setOpenMobile } = useSidebar();
    const { threadId } = useParams();

    const [data, query] =
        api.thread.getInfiniteThreads.useSuspenseInfiniteQuery(
            { limit: 20 },
            { getNextPageParam: (lastPage) => lastPage.nextCursor }
        );

    if (!session.data?.user.id) {
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

    const groupedThreads = groupThreadsByDate(filteredThreads);

    const labelMap: Record<keyof typeof groupedThreads, string> = {
        pinned: "Pinned Thread",
        today: "Today",
        yesterday: "Yesterday",
        lastWeek: "Last 7 days",
        lastMonth: "Last 30 days",
        older: "Older than last month",
    };

    return (
        <SidebarGroup>
            <SidebarGroupContent>
                <SidebarMenu>
                    <div className="flex flex-col gap-6">
                        {Object.entries(groupedThreads).map(
                            ([label, threads]) => {
                                if (threads.length === 0) return null;

                                return (
                                    <div key={label}>
                                        <SidebarGroupLabel>
                                            {
                                                labelMap[
                                                label as keyof typeof groupedThreads
                                                ]
                                            }
                                        </SidebarGroupLabel>
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

"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useTransition, Suspense } from "react";
import { Folder } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { DialogTitle } from "@radix-ui/react-dialog";

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
    useSidebar,
} from "~/components/ui/sidebar";
import {
    CommandDialog,
    CommandEmpty,
    CommandInput,
    CommandItem,
    CommandList,
} from "~/components/ui/command";
import { InfinitScroll } from "~/components/infinite-scroll";
import { Skeleton } from "~/components/ui/skeleton";
import { ThreadItem } from "./thread-item";
import { api } from "~/trpc/react";
import { groupThreadsByDate } from "./thread-sidebar.utils";
import { useSession } from "next-auth/react";
import { type DB_PROJECT_TYPE, type DB_THREAD_TYPE } from "~/server/db/schema";
import { ProjectSection } from "./project";
import { ErrorBoundary } from "react-error-boundary";

export type ProjectWithThreads = DB_PROJECT_TYPE & {
    threads: DB_THREAD_TYPE[];
};

type SearchableThread = {
    thread: DB_THREAD_TYPE;
    project?: DB_PROJECT_TYPE;
    isProjectThread: boolean;
};

function ThreadSidebarItemsSkeleton() {
    return (
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
    );
}

export interface SidebarHistoryProps {
    searchQuery: string;
}

export function SidebarSection({ searchQuery }: SidebarHistoryProps) {
    return (
        <Suspense fallback={<ThreadSidebarItemsSkeleton />}>
            <ErrorBoundary fallback={<p>Error</p>}>
                <SidebarHistory searchQuery={searchQuery} />
            </ErrorBoundary>
        </Suspense>
    );
}

export function SidebarHistory({ searchQuery }: SidebarHistoryProps) {
    const session = useSession();
    const { setOpenMobile } = useSidebar();
    const params = useParams();
    const router = useRouter();
    const [, startTransition] = useTransition();

    const [navigatingToId, setNavigatingToId] = useState<string | null>(null);

    const threadId = Array.isArray(params.threadId)
        ? params.threadId[0]
        : (params.threadId ?? undefined);

    useEffect(() => {
        if (threadId && navigatingToId === threadId) {
            setNavigatingToId(null);
        }
    }, [threadId, navigatingToId]);

    const [fetchedProjects] = api.project.getAllProjects.useSuspenseQuery();
    const [data, query] =
        api.thread.getInfiniteThreads.useSuspenseInfiniteQuery(
            { limit: 20 },
            { getNextPageParam: (lastPage) => lastPage.nextCursor }
        );

    const [openCommand, setOpenCommand] = useState(false);
    const [commandSearch, setCommandSearch] = useState("");

    const searchableThreads = useMemo((): SearchableThread[] => {
        if (!data?.pages) return [];

        const allThreads = data.pages.flatMap((page) => page.items);
        const threads: SearchableThread[] = [];

        fetchedProjects.forEach((project) => {
            const projectThreads = allThreads.filter(
                (thread) => thread.projectId === project.id
            );
            projectThreads.forEach((thread) => {
                threads.push({
                    thread,
                    project,
                    isProjectThread: true,
                });
            });
        });

        const unassignedThreads = allThreads.filter(
            (thread) => !thread.projectId
        );
        unassignedThreads.forEach((thread) => {
            threads.push({
                thread,
                isProjectThread: false,
            });
        });

        return threads;
    }, [data?.pages, fetchedProjects]);

    const filteredSearchResults = useMemo(() => {
        if (!commandSearch.trim()) return [];

        const query = commandSearch.toLowerCase().trim();
        return searchableThreads.filter(({ thread, project }) => {
            const threadTitle = thread.title?.toLowerCase() ?? "";
            const projectName = project?.title?.toLowerCase() ?? "";

            return threadTitle.includes(query) || projectName.includes(query);
        });
    }, [commandSearch, searchableThreads]);

    const handleThreadSelect = (thread: DB_THREAD_TYPE) => {
        setOpenCommand(false);
        setOpenMobile(false);

        setNavigatingToId(thread.id);

        startTransition(() => {
            router.push(`/chat/${thread.id}`);
        });
    };

    const isThreadActive = (thread: DB_THREAD_TYPE): boolean => {
        if (navigatingToId === thread.id) {
            return true;
        }
        if (navigatingToId && navigatingToId !== thread.id) {
            return false;
        }
        return thread.id === threadId;
    };

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpenCommand((openCommand) => !openCommand);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

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
                    <ThreadSidebarItemsSkeleton />
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

    const projectsWithThreads: ProjectWithThreads[] = fetchedProjects.map(
        (project) => {
            const projectThreads = allThreads.filter(
                (thread) => thread.projectId === project.id
            );

            return {
                ...project,
                threads: projectThreads,
            };
        }
    );

    const unassignedThreads = allThreads.filter((thread) => !thread.projectId);

    const activeThread = allThreads.find((thread) => thread.id === threadId);
    const activeThreadProjectId = activeThread?.projectId ?? null;

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

    const normalizedQuery = searchQuery?.toLowerCase().trim() || "";
    const isSearchEmpty = !normalizedQuery;

    const filteredUnassignedThreads = isSearchEmpty
        ? unassignedThreads
        : unassignedThreads.filter((thread) =>
              thread.title?.toLowerCase().includes(normalizedQuery)
          );

    const hasProjectMatches =
        !isSearchEmpty &&
        projectsWithThreads.some((project) =>
            project.threads.some((thread) =>
                thread.title?.toLowerCase().includes(normalizedQuery)
            )
        );

    const hasUnassignedMatches = filteredUnassignedThreads.length > 0;

    if (!isSearchEmpty && !hasProjectMatches && !hasUnassignedMatches) {
        return (
            <>
                <ProjectSection
                    projectWithThreads={projectsWithThreads}
                    activeThreadProjectId={activeThreadProjectId}
                    threadId={threadId}
                    searchQuery={searchQuery}
                    navigatingToId={navigatingToId}
                    onThreadSelect={handleThreadSelect}
                />
                <SidebarGroup>
                    <SidebarGroupContent>
                        <div className="flex w-full flex-row items-center justify-center gap-2 px-2 text-sm text-zinc-500">
                            No threads found matching your search.
                        </div>
                    </SidebarGroupContent>
                </SidebarGroup>
            </>
        );
    }

    const groupedThreads = groupThreadsByDate(filteredUnassignedThreads);

    const labelMap: Record<keyof typeof groupedThreads, string> = {
        pinned: "Pinned Thread",
        today: "Today",
        yesterday: "Yesterday",
        lastWeek: "Last 7 days",
        lastMonth: "Last 30 days",
        older: "Older than last month",
    };

    const hasUnassignedThreadsToShow = Object.values(groupedThreads).some(
        (threads) => threads.length > 0
    );

    return (
        <>
            <ProjectSection
                activeThreadProjectId={activeThreadProjectId}
                projectWithThreads={projectsWithThreads}
                threadId={threadId}
                searchQuery={searchQuery}
                navigatingToId={navigatingToId}
                onThreadSelect={handleThreadSelect}
            />
            {hasUnassignedThreadsToShow && (
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
                                                    <SidebarMenuItem
                                                        key={thread.id}
                                                    >
                                                        <ThreadItem
                                                            projectWithThreads={
                                                                projectsWithThreads
                                                            }
                                                            isProjectItem={
                                                                false
                                                            }
                                                            key={thread.id}
                                                            thread={thread}
                                                            isActive={isThreadActive(
                                                                thread
                                                            )}
                                                            setOpenMobile={
                                                                setOpenMobile
                                                            }
                                                            onThreadSelect={
                                                                handleThreadSelect
                                                            }
                                                        />
                                                    </SidebarMenuItem>
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
            )}
            <CommandDialog open={openCommand} onOpenChange={setOpenCommand}>
                <CommandInput
                    placeholder="Search threads..."
                    value={commandSearch}
                    onValueChange={setCommandSearch}
                />
                <VisuallyHidden>
                    <DialogTitle>Search Threads</DialogTitle>
                </VisuallyHidden>
                <CommandList className="max-h-[400px] overflow-y-auto">
                    {query.isLoading ? (
                        <div className="space-y-2 p-2">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-3 px-2 py-2"
                                >
                                    <Skeleton className="h-4 w-4 rounded" />
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-2 w-1 rounded-full" />
                                    <Skeleton className="h-4 max-w-[200px] flex-1" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <CommandEmpty>No threads found.</CommandEmpty>
                            {(commandSearch.trim()
                                ? filteredSearchResults
                                : searchableThreads
                            ).map(({ thread, project, isProjectThread }) => (
                                <CommandItem
                                    key={thread.id}
                                    onSelect={() => handleThreadSelect(thread)}
                                    className="flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors hover:bg-accent/50"
                                >
                                    <div className="flex min-w-0 flex-1 items-center gap-2">
                                        {isProjectThread && project ? (
                                            <>
                                                <Folder className="h-4 w-4 flex-shrink-0 text-primary" />
                                                <span className="max-w-[80px] truncate text-sm font-medium text-muted-foreground">
                                                    {project.title}
                                                </span>
                                                <div className="h-1 w-1 flex-shrink-0 rounded-full bg-muted-foreground/40" />
                                                <span className="flex-1 truncate text-sm font-medium">
                                                    {thread.title ||
                                                        "Untitled Thread"}
                                                </span>
                                            </>
                                        ) : (
                                            <span className="ml-6 flex-1 truncate text-sm font-medium">
                                                {thread.title ||
                                                    "Untitled Thread"}
                                            </span>
                                        )}
                                    </div>
                                    {isThreadActive(thread) && (
                                        <div className="h-2 w-2 flex-shrink-0 rounded-full text-primary" />
                                    )}
                                </CommandItem>
                            ))}
                        </>
                    )}
                </CommandList>
            </CommandDialog>
        </>
    );
}

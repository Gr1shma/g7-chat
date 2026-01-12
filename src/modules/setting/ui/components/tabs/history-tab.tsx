"use client";

import { Suspense, useState, useMemo, useCallback } from "react";
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { api } from "~/trpc/react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { ErrorBoundary } from "react-error-boundary";
import { PinIcon } from "lucide-react";
import { InfinitScroll } from "~/components/infinite-scroll";
import type { DB_THREAD_TYPE } from "~/server/db/schema";

export function HistorySection() {
    return (
        <Suspense fallback={<p>Loading</p>}>
            <ErrorBoundary fallback={<p>Error</p>}>
                <HistoryTabSuspense />
            </ErrorBoundary>
        </Suspense>
    );
}

export function HistoryTabSuspense() {
    const [data, query] =
        api.thread.getInfiniteThreads.useSuspenseInfiniteQuery(
            { limit: 20 },
            { getNextPageParam: (lastPage) => lastPage.nextCursor }
        );
    const [selectedThreadIds, setSelectedThreadIds] = useState<
        Record<string, boolean>
    >({});
    const [isDownloading, setIsDownloading] = useState(false);

    const allThreads = useMemo(
        () => data?.pages.flatMap((page) => page.items) ?? [],
        [data?.pages]
    );

    const selectedIds = useMemo(
        () =>
            Object.entries(selectedThreadIds)
                .filter(([_, selected]) => selected)
                .map(([id]) => id),
        [selectedThreadIds]
    );

    const historyQuery = api.user.getHistory.useQuery(
        { threadIds: selectedIds },
        {
            enabled: false, // Only run when manually triggered
            retry: false,
        }
    );

    const toggleThreadSelection = useCallback((threadId: string) => {
        setSelectedThreadIds((prev) => ({
            ...prev,
            [threadId]: !prev[threadId],
        }));
    }, []);

    const toggleAllThreads = useCallback(
        (checked: boolean) => {
            if (!checked) {
                setSelectedThreadIds({});
                return;
            }

            const newSelected: Record<string, boolean> = {};
            allThreads.forEach((thread) => {
                newSelected[thread.id] = true;
            });
            setSelectedThreadIds(newSelected);
        },
        [allThreads]
    );

    const handleSubmit = useCallback(async () => {
        if (selectedIds.length === 0) {
            alert("Please select at least one thread.");
            return;
        }

        try {
            setIsDownloading(true);
            const historyData = await historyQuery.refetch();

            if (historyData.data) {
                const blob = new Blob(
                    [JSON.stringify(historyData.data, null, 2)],
                    {
                        type: "application/json",
                    }
                );
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "history.json";
                a.click();
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error("Failed to download history:", error);
            alert("Failed to download history. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    }, [historyQuery, selectedIds]);

    const columns = useMemo<ColumnDef<DB_THREAD_TYPE>[]>(
        () => [
            {
                id: "select",
                header: () => (
                    <div className="flex items-center justify-center">
                        <Checkbox
                            checked={
                                allThreads.length > 0 &&
                                selectedIds.length === allThreads.length
                            }
                            onCheckedChange={toggleAllThreads}
                            aria-label="Select all"
                        />
                    </div>
                ),
                cell: ({ row }) => (
                    <div className="flex items-center justify-center">
                        <Checkbox
                            checked={!!selectedThreadIds[row.original.id]}
                            onCheckedChange={(_checked) => {
                                toggleThreadSelection(row.original.id);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            aria-label="Select row"
                        />
                    </div>
                ),
                enableSorting: false,
                enableHiding: false,
            },
            {
                accessorKey: "title",
                header: "Title",
            },
            {
                accessorKey: "isPinned",
                header: "Pinned",
                cell: ({ row }) =>
                    row.getValue("isPinned") ? (
                        <PinIcon className="h-4 w-4 text-pink-600" />
                    ) : null,
            },
            {
                accessorKey: "updatedAt",
                header: "Updated At",
                cell: ({ row }) => {
                    const date = row.getValue("updatedAt");

                    if (!date) return "";

                    try {
                        if (date instanceof Date) {
                            return (
                                <span suppressHydrationWarning>
                                    {date.toLocaleDateString()}
                                </span>
                            );
                        }

                        const parsedDate = new Date(date as string | number);

                        if (isNaN(parsedDate.getTime())) {
                            return "";
                        }

                        return (
                            <span suppressHydrationWarning>
                                {parsedDate.toLocaleDateString()}
                            </span>
                        );
                    } catch {
                        console.warn("Invalid date format:", date);
                        return "";
                    }
                },
            },
            {
                accessorKey: "visibility",
                header: "Visibility",
                cell: ({ row }) =>
                    row.getValue("visibility") === "private"
                        ? "Private"
                        : "Public",
            },
        ],
        [
            allThreads.length,
            selectedIds.length,
            selectedThreadIds,
            toggleAllThreads,
            toggleThreadSelection,
        ]
    );

    const table = useReactTable({
        data: allThreads,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const selectedCount = selectedIds.length;

    return (
        <div className="space-y-2">
            <h2 className="text-2xl font-bold">Message History</h2>

            <div className="space-y-6">
                <p className="text-muted-foreground/80">
                    Save your history as JSON
                </p>
                <div className="max-h-96 overflow-auto rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext()
                                                  )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={
                                            selectedThreadIds[row.original.id]
                                                ? "selected"
                                                : undefined
                                        }
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    {query.hasNextPage && (
                        <InfinitScroll
                            hasNextPage={query.hasNextPage}
                            isFetchingNextPage={query.isFetchingNextPage}
                            fetchNextPage={query.fetchNextPage}
                        />
                    )}
                </div>
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        {selectedCount} of {allThreads.length} thread(s)
                        selected
                    </div>
                    <Button
                        onClick={handleSubmit}
                        disabled={selectedCount === 0 || isDownloading}
                    >
                        {isDownloading
                            ? "Downloading..."
                            : "Download Selected History JSON"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

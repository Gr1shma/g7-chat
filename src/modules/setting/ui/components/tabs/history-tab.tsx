import { api } from "~/trpc/react";

export default function HistoryTab() {
    const [data, query] =
        api.thread.getInfiniteThreads.useSuspenseInfiniteQuery(
            { limit: 20 },
            { getNextPageParam: (lastPage) => lastPage.nextCursor }
        );

    return <div></div>;
}

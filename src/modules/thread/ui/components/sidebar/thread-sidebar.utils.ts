import { isToday, isYesterday, subMonths, subWeeks } from "date-fns";
import type { DB_THREAD_TYPE } from "~/server/db/schema";

export type GroupedThreads = {
    pinned: DB_THREAD_TYPE[];
    today: DB_THREAD_TYPE[];
    yesterday: DB_THREAD_TYPE[];
    lastWeek: DB_THREAD_TYPE[];
    lastMonth: DB_THREAD_TYPE[];
    older: DB_THREAD_TYPE[];
};

export const groupThreadsByDate = (threads: DB_THREAD_TYPE[]): GroupedThreads => {
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

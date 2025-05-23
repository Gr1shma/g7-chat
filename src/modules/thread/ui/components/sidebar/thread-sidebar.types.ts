import type { DB_THREAD_TYPE } from "~/server/db/schema";

export interface ThreadItemProps {
    thread: DB_THREAD_TYPE;
    isActive: boolean;
    setOpenMobile: (open: boolean) => void;
}

export interface SidebarHistoryProps {
    searchQuery: string;
}

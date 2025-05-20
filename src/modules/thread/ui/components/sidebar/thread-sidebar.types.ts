import type { User } from "next-auth";
import type { DB_THREAD_TYPE } from "~/server/db/schema";

export interface ThreadSidebarProps {
    user: User;
}

export interface SidebarUserNavProps {
    user: User;
}

export interface ThreadItemProps {
    thread: DB_THREAD_TYPE;
    isActive: boolean;
    setOpenMobile: (open: boolean) => void;
}

export interface SidebarHistoryProps extends ThreadSidebarProps {
    searchQuery: string;
}

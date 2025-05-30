import type { DB_THREAD_TYPE } from "~/server/db/schema";
import type { ProjectWithThreads } from "./thread-sidebar-group";

export interface ThreadItemProps {
    thread: DB_THREAD_TYPE;
    isActive: boolean;
    setOpenMobile: (open: boolean) => void;
    isProjectItem: boolean;
    projectWithThreads: ProjectWithThreads[];
}

export interface SidebarHistoryProps {
    searchQuery: string;
}

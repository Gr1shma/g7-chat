import { Ellipsis, Share2, Trash2 } from "lucide-react";
import { type Dispatch, type SetStateAction, useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { DB_THREAD_TYPE } from "~/server/db/schema";
import { ThreadDeleteDailog } from "./thread-delete-dailog";

export function ThreadDropDownButton({
    thread,
    onOpenChange,
    isActive,
}: {
    thread: DB_THREAD_TYPE;
    onOpenChange: Dispatch<SetStateAction<boolean>>;
    isActive: boolean;
}) {
    const [showAlert, setShowAlert] = useState(false);
    return (
        <>
            <DropdownMenu onOpenChange={onOpenChange}>
                <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md outline-none transition-colors hover:bg-muted/90">
                    <Ellipsis className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    sideOffset={8}
                    className="w-48 border-border bg-secondary shadow-lg"
                >
                    <DropdownMenuLabel className="truncate px-3 py-2 text-xs font-medium text-muted-foreground">
                        {thread.title}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm transition-colors hover:bg-accent focus:bg-accent">
                        <Share2 className="h-4 w-4 text-muted-foreground" />
                        <span>Share Link</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onSelect={() => setShowAlert(true)}
                        className="flex cursor-pointer items-center gap-3 bg-destructive/40 px-3 py-2 text-sm hover:bg-destructive/70"
                    >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete Thread</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <ThreadDeleteDailog
                open={showAlert}
                onOpenChange={setShowAlert}
                thread={thread}
                isActive={isActive}
            />
        </>
    );
}

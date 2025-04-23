import { SearchIcon, SquarePen as SquarePenIcon } from "lucide-react";
import type { User } from "next-auth";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
} from "~/components/ui/sidebar";
import { SidebarUserNav } from "./user-nav";
import { SidebarHistory } from "./history-sidebar";

interface ChatSidebarProps {
    user: User;
}

export function ChatSideBar({ user }: ChatSidebarProps) {
    console.log("Chat Side bar rendered");
    return (
        <Sidebar>
            <SidebarHeader>
                <div className="flex shrink-0 items-center justify-between text-lg text-neutral-200">
                    <Link href="/chat" className="font-light">
                        g7-chat
                    </Link>
                    <div className="flex flex-row items-center">
                        <Button
                            variant="ghost"
                            className="h-9 w-9 hover:bg-neutral-800/40 hover:text-white"
                        >
                            <SearchIcon />
                        </Button>
                        <Link href="/chat">
                            <Button
                                variant="ghost"
                                className="h-9 w-9 hover:bg-neutral-800/40 hover:text-white"
                            >
                                <SquarePenIcon />
                            </Button>
                        </Link>
                    </div>
                </div>
            </SidebarHeader>
            <Separator />
            <SidebarContent>
                <SidebarHistory user={user} />
            </SidebarContent>
            <Separator />
            <SidebarFooter>
                <SidebarUserNav user={user} />
            </SidebarFooter>
        </Sidebar>
    );
}

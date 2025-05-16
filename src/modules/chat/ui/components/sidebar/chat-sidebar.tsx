"use client";
import { SearchIcon } from "lucide-react";
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
import { useState } from "react";

interface ChatSidebarProps {
    user: User;
}

export function ChatSideBar({ user }: ChatSidebarProps) {
    const [searchQuery, setSearchQuery] = useState("");
    return (
        <Sidebar>
            <SidebarHeader>
                <div className="flex h-8 shrink-0 items-center justify-center text-lg text-muted-foreground transition-opacity delay-75 duration-75">
                    <Link href="/chat" className="font-light">
                        g7-chat
                    </Link>
                </div>
                <div className="px-1">
                    <Button
                        variant="default"
                        className="w-full bg-pink-600/70 hover:bg-pink-500/70 hover:text-white"
                        asChild
                    >
                        <Link href="/chat">
                            <span className="w-full select-none text-center">
                                New Chat
                            </span>
                        </Link>
                    </Button>
                </div>
                <div className="border-chat-border border-b px-3">
                    <div className="flex items-center">
                        <SearchIcon className="mr-3 size-4" />
                        <input
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent py-2 text-sm text-foreground placeholder-muted-foreground/50 placeholder:select-none focus:outline-none"
                            placeholder="Searh your chats..."
                        />
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarHistory user={user} searchQuery={searchQuery} />
            </SidebarContent>
            <Separator />
            <SidebarFooter>
                <SidebarUserNav user={user} />
            </SidebarFooter>
        </Sidebar>
    );
}

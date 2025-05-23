"use client";
import { SearchIcon } from "lucide-react";
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
import { SidebarSection } from "./thread-sidebar-group";
import { useState } from "react";

export function ThreadSideBar() {
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
                        className="w-full hover:text-white"
                        asChild
                    >
                        <Link href="/chat">
                            <span className="w-full select-none text-center">
                                New Chat
                            </span>
                        </Link>
                    </Button>
                </div>
                <div className="border-b px-3">
                    <div className="flex items-center">
                        <SearchIcon className="mr-3 size-4" />
                        <input
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent py-2 text-sm text-foreground placeholder-muted-foreground/50 placeholder:select-none focus:outline-none"
                            placeholder="Search your threads..."
                        />
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarSection searchQuery={searchQuery} />
            </SidebarContent>
            <Separator />
            <SidebarFooter>
                <SidebarUserNav />
            </SidebarFooter>
        </Sidebar>
    );
}

import { Calendar, Home, Inbox, Search, SearchIcon, Settings, SquarePen } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "~/components/ui/sidebar";

const items = [
    {
        title: "Home",
        url: "#",
        icon: Home,
    },
    {
        title: "Inbox",
        url: "#",
        icon: Inbox,
    },
    {
        title: "Calendar",
        url: "#",
        icon: Calendar,
    },
    {
        title: "Search",
        url: "#",
        icon: Search,
    },
    {
        title: "Settings",
        url: "#",
        icon: Settings,
    },
];

export function ChatSideBar() {
    return (
        <Sidebar>
            <SidebarContent>
                <SidebarHeader>
                    <div className="flex shrink-0 items-center justify-between text-neutral-200 text-lg">
                        <Link
                            href="/chat"
                            className="font-light"
                        >
                            g7-chat
                        </Link>
                        <div className="flex flex-row items-center">
                            <Button variant="ghost" className="h-9 w-9 hover:bg-neutral-800/40 hover:text-white">
                                <SearchIcon />
                            </Button>
                            <Button variant="ghost" className="h-9 w-9 hover:bg-neutral-800/40 hover:text-white">
                                <SquarePen />
                            </Button>
                        </div>
                    </div>
                </SidebarHeader>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}

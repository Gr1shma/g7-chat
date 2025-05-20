"use client";

import Link from "next/link";

import { redirect } from "next/navigation";
import { UserAvatar } from "~/components/user-avatar";
import { type SidebarUserNavProps } from "./thread-sidebar.types";

export function SidebarUserNav({ user }: SidebarUserNavProps) {
    if (!user) {
        redirect("/auth");
    }
    return (
        <div className="m-0 flex flex-col gap-2 p-2 pt-0">
            <Link
                href="/setting"
                className="flex select-none flex-row items-center justify-between gap-3 rounded-lg px-3 py-3 hover:bg-sidebar-accent focus:bg-sidebar-accent focus:outline-2"
            >
                <div className="flex flex-row items-center gap-3">
                    <UserAvatar
                        imageUrl={user.image!}
                        size="default"
                        name={user.name!}
                    />
                    <div className="flex text-foreground">
                        <span className="text-sm font-medium">{user.name}</span>
                    </div>
                </div>
            </Link>
        </div>
    );
}

"use client";
import { SettingsIcon } from "lucide-react";
import type { User } from "next-auth";
import Link from "next/link";

import { redirect } from "next/navigation";
import { UserAvatar } from "~/components/user-avatar";

export function SidebarUserNav({ user }: { user: User }) {
    if (!user) {
        redirect("/auth");
    }
    return (
        <div className="flex w-full flex-row items-center justify-between gap-3 p-2">
            <div className="flex flex-row items-center gap-3">
                <UserAvatar
                    imageUrl={user.image!}
                    size="default"
                    name={user.name!}
                />
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-neutral-200">
                        {user.name}
                    </span>
                </div>
            </div>
            <Link
                className="text-neutral-400 hover:text-neutral-200"
                href="/setting"
            >
                <SettingsIcon className="size-5" />
            </Link>
        </div>
    );
}

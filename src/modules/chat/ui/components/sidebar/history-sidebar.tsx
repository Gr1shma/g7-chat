"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import type { User } from "next-auth";
import { memo, useEffect } from "react";
import useSWR from "swr";

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "~/components/ui/sidebar";

import { fetcher } from "~/lib/utils";
import { DB_CHAT_TYPE } from "~/server/db/schema";
import { MessageSquare as MessageSquareIcon } from "lucide-react";

const PureChatItem = ({
    chat,
    isActive,
    setOpenMobile,
}: {
    chat: DB_CHAT_TYPE;
    isActive: boolean;
    setOpenMobile: (open: boolean) => void;
}) => {
    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive}>
                <Link
                    href={`/chat/${chat.id}`}
                    onClick={() => setOpenMobile(false)}
                >
                    <div className="flex flex-1 flex-row gap-2 rounded-sm py-1">
                        <MessageSquareIcon className="size-5" />
                        <p className="w-full text-clip whitespace-nowrap text-sm text-neutral-100">
                            {chat.title}
                        </p>
                    </div>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
};

export const ChatItem = memo(PureChatItem, (prevProps, nextProps) => {
    if (prevProps.isActive !== nextProps.isActive) return false;
    return true;
});

export function SidebarHistory({ user }: { user: User | undefined }) {
    const { setOpenMobile } = useSidebar();
    const { id } = useParams();
    const pathname = usePathname();
    const { data, mutate } = useSWR<Array<DB_CHAT_TYPE>>(
        user ? "/api/history" : null,
        fetcher,
        {
            fallbackData: [],
        }
    );

    useEffect(() => {
        mutate();
    }, [pathname, mutate]);

    return (
        <>
            <SidebarGroup>
                <SidebarGroupContent>
                    <SidebarMenu>
                        {data &&
                            (() => {
                                return (
                                    <>
                                        {data.length > 0 && (
                                            <>
                                                {data.map(
                                                    (chat: DB_CHAT_TYPE) => (
                                                        <ChatItem
                                                            key={chat.id}
                                                            chat={chat}
                                                            isActive={
                                                                chat.id === id
                                                            }
                                                            setOpenMobile={
                                                                setOpenMobile
                                                            }
                                                        />
                                                    )
                                                )}
                                            </>
                                        )}
                                    </>
                                );
                            })()}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </>
    );
}

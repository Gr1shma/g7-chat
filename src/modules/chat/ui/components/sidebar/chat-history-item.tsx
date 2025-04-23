import { DB_CHAT_TYPE } from "~/server/db/schema";

import Link from "next/link";

import { memo } from "react";

import { SidebarMenuItem, SidebarMenuButton } from "~/components/ui/sidebar";

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
                    <span>{chat.title}</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
};

export const ChatItem = memo(PureChatItem, (prevProps, nextProps) => {
    if (prevProps.isActive !== nextProps.isActive) return false;
    return true;
});

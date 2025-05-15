import { notFound, redirect } from "next/navigation";
import { convertToUIMessages } from "~/lib/utils";

import { ChatView } from "~/modules/chat/ui/views/chat-view";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";

export const dynamic = "force-dynamic";

export default async function Page({
    params,
}: {
    params: Promise<{ chatId: string }>;
}) {
    const session = await auth();
    if (!session) {
        redirect("/auth");
    }

    const { chatId } = await params;
    const chat = await api.chat.getChatById(chatId);
    if (!chat) {
        notFound();
    }
    const messagesFromDb = await api.message.getMessagesByChatId(chatId);
    return (
        <ChatView
            chatId={chatId}
            initialMessages={convertToUIMessages(messagesFromDb)}
        />
    );
}

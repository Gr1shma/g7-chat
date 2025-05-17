import { notFound, redirect } from "next/navigation";
import { convertToUIMessages } from "~/lib/utils";

import { ChatView } from "~/modules/chat/ui/views/chat-view";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ chatId: string }>;
}) {
    const { chatId } = await params;
    const chat = await api.chat.getChatById(chatId);

    if (!chat) {
        notFound();
    }
    return {
        title: `${chat.title} - g7-chat`,
    };
}

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

    const initialMessages = convertToUIMessages(
        await api.message.getMessagesByChatId(chatId)
    );
    const chat = await api.chat.getChatById(chatId);

    if (!chat) {
        notFound();
    }

    return <ChatView chatId={chat.id} initialMessages={initialMessages} />;
}

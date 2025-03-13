import { notFound, redirect } from "next/navigation";
import { convertToUIMessages } from "~/lib/utils";

import { ChatView } from "~/modules/chat/ui/views/chat-view";
import { auth } from "~/server/auth";
import { QUERIES } from "~/server/db/queries";

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
    const chat = await QUERIES.chatQueries.getChatById({ id: chatId });
    if (!chat) {
        notFound();
    }
    const messagesFromDb = await QUERIES.messageQueries.getMessagesByChatId({
        chatId,
    });

    return (
        <ChatView
            chatId={chatId}
            initialMessages={convertToUIMessages(messagesFromDb)}
        />
    );
}

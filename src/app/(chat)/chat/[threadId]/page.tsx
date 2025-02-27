import { notFound, redirect } from "next/navigation";
import { convertToUIMessages } from "~/lib/utils";

import { ChatView } from "~/modules/chat/ui/views/chat-view";
import { auth } from "~/server/auth";
import { QUERIES } from "~/server/db/queries";

export const dynamic = "force-dynamic";

export default async function Page({
    params,
}: {
    params: Promise<{ threadId: string }>;
}) {
    const session = await auth();
    if (!session) {
        redirect("/auth");
    }

    const { threadId } = await params;
    const chat = await QUERIES.thread.getById({ id: threadId });
    if (!chat) {
        notFound();
    }
    const messagesFromDb = await QUERIES.message.getByThreadId({
        threadId,
    });

    return (
        <ChatView
            threadId={threadId}
            initialMessages={convertToUIMessages(messagesFromDb)}
        />
    );
}

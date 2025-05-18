import { notFound, redirect } from "next/navigation";
import { convertToUIMessages } from "~/lib/utils";

import { ThreadView } from "~/modules/thread/ui/views/thread-view";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ threadId: string }>;
}) {
    const { threadId } = await params;
    const thread = await api.thread.getThreadById(threadId);

    if (!thread) {
        notFound();
    }
    return {
        title: `${thread.title} - g7-chat`,
    };
}

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

    const thread = await api.thread.getThreadById(threadId);
    if (!thread) {
        notFound();
    }

    const initialMessages = convertToUIMessages(
        await api.message.getMessagesByThreadId(threadId)
    );

    return (
        <ThreadView threadId={thread.id} initialMessages={initialMessages} />
    );
}

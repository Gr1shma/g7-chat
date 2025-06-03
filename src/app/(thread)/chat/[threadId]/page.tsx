import { notFound, redirect } from "next/navigation";

import { ThreadViewSection } from "~/modules/thread/ui/views/thread-view";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";

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
    params: { threadId: string };
}) {
    const { threadId } = params;

    const thread = await api.thread.getThreadById(threadId);

    if (!thread) {
        notFound();
    }

    if (thread.visibility !== "public") {
        const session = await auth();

        if (!session) {
            redirect("/auth");
        }

        if (thread.userId !== session.user.id) {
            notFound();
        }
    }

    void api.message.getMessagesByThreadId.prefetch(threadId);

    return (
        <HydrateClient>
            <ThreadViewSection threadId={thread.id} />
        </HydrateClient>
    );
}

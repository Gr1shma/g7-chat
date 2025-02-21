import { redirect } from "next/navigation";

import { ChatView } from "~/modules/chat/ui/views/chat-view";
import { auth } from "~/server/auth";

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
    return <ChatView chatId={chatId} />;
}

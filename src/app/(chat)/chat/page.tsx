import { redirect } from "next/navigation";

import { ChatView } from "~/modules/chat/ui/views/chat-view";
import { auth } from "~/server/auth";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
    const session = await auth();
    if (!session) {
        redirect("/auth");
    }
    const threadId = crypto.randomUUID();

    return <ChatView threadId={threadId} initialMessages={[]} />;
}

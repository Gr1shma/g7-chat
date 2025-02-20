import { ChatView } from "~/modules/chat/ui/views/chat-view";

export const dynamic = "force-dynamic";

export default function ChatPage() {
    const chatId = crypto.randomUUID();

    return <ChatView chatId={chatId} />;
}

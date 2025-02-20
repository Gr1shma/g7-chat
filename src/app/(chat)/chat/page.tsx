import { ChatView } from "~/modules/chat/ui/views/chat-view";

export default function ChatPage() {
    const chatId = crypto.randomUUID();

    return <ChatView chatId={chatId}/>
}

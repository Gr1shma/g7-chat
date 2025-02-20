import type { Message } from "ai";

interface ChatMessagesProps {
    chatId: string;
    messages: Message[];
}

export function ChatMessages({ chatId, messages }: ChatMessagesProps) {
    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col space-y-12 p-4 pb-8">
            <div>{chatId}</div>
            {messages.map((m) =>
                m.role === "user" ? (
                    <div className="flex justify-end" key={m.id}>
                        <div className="group relative inline-block max-w-[80%] break-words rounded-2xl bg-[#2D2D2D] p-4 text-left">
                            {m.content}
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-start" key={m.id}>
                        <div className="group relative w-full max-w-full break-words">
                            <div>{m.content}</div>
                        </div>
                    </div>
                )
            )}
        </div>
    );
}

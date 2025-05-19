import type { Message } from "ai";
import { Markdown } from "~/components/markdown";

interface MessageItemProps {
    message: Message;
    index: number;
    latestUserIndex?: number;
    nextAssistantIndex: number;
    userRef: React.RefObject<HTMLDivElement>;
    assistantSpaceRef: React.RefObject<HTMLDivElement>;
    showAssistantSpace: boolean;
    isNotFirstUserMessage: boolean;
}

export default function MessageItem({
    message,
    index,
    latestUserIndex,
    nextAssistantIndex,
    userRef,
    assistantSpaceRef,
    showAssistantSpace,
    isNotFirstUserMessage,
}: MessageItemProps) {
    const isLatestUser = index === latestUserIndex;
    const isNextAssistant = index === nextAssistantIndex;

    if (message.role === "user") {
        return (
            <>
                <div
                    ref={isLatestUser ? userRef : null}
                    className="flex justify-end"
                >
                    <div className="group relative inline-block max-w-[80%] break-words rounded-2xl bg-[#2D2D2D] p-4 text-left">
                        {message.content}
                    </div>
                </div>
                {isLatestUser && showAssistantSpace && isNotFirstUserMessage && (
                    <AnimationAndSpace assistantSpaceRef={assistantSpaceRef} />
                )}
            </>
        );
    }

    return (
        <div
            className={`mb-11 flex justify-start ${isNextAssistant ? "min-h-[calc(100vh-20rem)]" : ""
                }`}
        >
            <div className="group relative w-full max-w-full break-words">
                <Markdown>{message.content}</Markdown>
                
                {/* Need to write the logic */ false ? <ErrorMessage /> : null}
            </div>
        </div>
    );
}

function AnimationAndSpace({ assistantSpaceRef }: { assistantSpaceRef: React.RefObject<HTMLDivElement> }) {
    return (
        <div
            ref={assistantSpaceRef}
            className="mb-10 h-[calc(100vh-20rem)] w-full"
            aria-hidden="true"
        >
            <div className="rounded-2xl px-4 py-2">
                <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-secondary-foreground/40 [animation-delay:-0.3s]" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-secondary-foreground/40 [animation-delay:-0.15s]" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-secondary-foreground/40" />
                </div>
            </div>
        </div>
    )
}

function ErrorMessage() {
    return (
        <div className="mt-4 flex items-start gap-3 rounded-lg bg-red-500/15 px-4 py-3 text-sm text-red-900 dark:text-red-400">
            <div className="leading-relaxed">
                Stopped by user
            </div>
        </div>
    )
}

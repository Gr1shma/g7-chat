import { UseChatHelpers } from "ai/react";
import { Square } from "lucide-react";
import { Button } from "./ui/button";
import { memo } from "react";

function PureStopButton({
    stop,
    setMessages,
}: {
    stop: () => void;
    setMessages: UseChatHelpers["setMessages"];
}) {
    return (
        <Button
            data-testid="stop-button"
            variant="default"
            className="relative h-9 w-9 rounded-lg p-2"
            onClick={(event) => {
                event.preventDefault();
                stop();
                setMessages((messages) => messages);
            }}
        >
            <Square
                className="size-5"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth={2}
            />
        </Button>
    );
}

export const StopButton = memo(PureStopButton);

import { ArrowUpIcon } from "lucide-react";
import { Button } from "./ui/button";
import { memo } from "react";
import { type UseChatHelpers } from "ai/react";

function PureSendButton({
    submitForm,
    input,
    status,
}: {
    submitForm: () => void;
    input: string;
    status: UseChatHelpers["status"];
}) {
    return (
        <Button
            data-testid="send-button"
            variant="default"
            className="relative h-9 w-9 rounded-lg p-2"
            onClick={(event) => {
                event.preventDefault();
                submitForm();
            }}
            disabled={
                input.length === 0 ||
                status === "submitted" ||
                status === "streaming"
            }
        >
            <ArrowUpIcon
                className="size-5"
                stroke="currentColor"
                strokeWidth={2}
            />
        </Button>
    );
}

export const SendButton = memo(PureSendButton, (prevProps, nextProps) => {
    if (prevProps.input !== nextProps.input) return false;
    return true;
});

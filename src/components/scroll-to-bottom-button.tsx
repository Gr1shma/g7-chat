import { ChevronDown as ChevronDownIcon } from "lucide-react";
import { Button } from "./ui/button";

interface ScrollToBottomButtonProps {
    show: boolean;
    onClick: () => void;
}

export function ScrollToBottomButton({
    show,
    onClick,
}: ScrollToBottomButtonProps) {
    if (!show) return null;

    return (
        <Button
            variant="default"
            className="flex h-8 items-center gap-2 rounded-full bg-secondary px-3 text-xs text-secondary-foreground opacity-90 shadow-sm hover:bg-secondary/80 hover:opacity-100"
            onClick={onClick}
        >
            Scroll to bottom <ChevronDownIcon className="size-4" />
        </Button>
    );
}

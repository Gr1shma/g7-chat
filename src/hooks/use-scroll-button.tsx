import { useState } from "react";

export function useScrollToBottomButton(ref: React.RefObject<HTMLElement>) {
    const [showScrollButton, setShowScrollButton] = useState(false);

    const handleScroll = () => {
        if (!ref.current) return;
        const { scrollTop, scrollHeight, clientHeight } = ref.current;
        setShowScrollButton(scrollTop + clientHeight < scrollHeight - 50);
    };

    return { showScrollButton, handleScroll };
}

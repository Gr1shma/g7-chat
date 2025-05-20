import { SendButton } from "~/components/send-button";
import { StopButton } from "~/components/stop-button";
import { InputToolbarProps } from "./thread-input.types";

export function InputToolbar({
    input,
    status,
    stop,
    submitForm,
    setMessages,
}: InputToolbarProps) {
    return (
        <div className="-mb-px mt-2 flex w-full flex-row-reverse justify-between">
            <div className="-mr-0.5 -mt-0.5 flex items-center justify-center gap-2">
                {status === "submitted" || status === "streaming" ? (
                    <StopButton stop={stop} setMessages={setMessages} />
                ) : (
                    <SendButton input={input} submitForm={submitForm} />
                )}
            </div>
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <div className="ml-[-7px] flex items-center gap-1">
                    {/* Model Selector */}
                </div>
            </div>
        </div>
    );
}

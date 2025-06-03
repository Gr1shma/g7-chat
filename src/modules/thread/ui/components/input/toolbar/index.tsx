import { SendButton } from "~/components/send-button";
import { type InputToolbarProps } from "../thread-input.types";
import { ModelSelector } from "./model-selector";

export function InputToolbar({
    input,
    status,
    submitForm,
    onModelChange,
    selectedModel,
}: InputToolbarProps) {
    return (
        <div className="-mb-px mt-2 flex w-full flex-row-reverse justify-between">
            <div className="-mr-0.5 -mt-0.5 flex items-center justify-center gap-2">
                <SendButton
                    input={input}
                    submitForm={submitForm}
                    status={status}
                />
            </div>
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <div className="ml-[-7px] flex items-center gap-1">
                    <ModelSelector
                        selectedModel={selectedModel}
                        onModelChange={onModelChange}
                    />
                </div>
            </div>
        </div>
    );
}

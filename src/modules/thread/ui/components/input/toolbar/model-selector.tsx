import { Check, ChevronDown, Cpu, Search } from "lucide-react";
import { useCallback, useState, useMemo, useRef, useEffect } from "react";
import { Button } from "~/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "~/components/ui/popover";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { useModelStore } from "~/lib/ai/model-store";
import { AI_MODELS, getModelConfig, type AIModel } from "~/lib/ai/models";
import { useAPIKeyStore } from "~/lib/ai/store";

export function ChatModelDropdown() {
    const getKey = useAPIKeyStore((state) => state.getKey);
    const { selectedModel, setModel } = useModelStore();

    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const inputRef = useRef<HTMLInputElement | null>(null);

    const isModelEnabled = useCallback(
        (model: AIModel) => {
            const config = getModelConfig(model);
            return !!getKey(config.provider);
        },
        [getKey]
    );
    if (!isModelEnabled(selectedModel)) {
        setModel("Gemini 2.5 Flash");
    }

    const filteredModels = useMemo(
        () =>
            AI_MODELS.filter((model) =>
                model.toLowerCase().includes(searchQuery.toLowerCase())
            ),
        [searchQuery]
    );

    const selectedModelIndex = useMemo(() => {
        return filteredModels.findIndex((model) => model === selectedModel);
    }, [filteredModels, selectedModel]);

    const [highlightedIndex, setHighlightedIndex] =
        useState(selectedModelIndex);

    const handleModelSelect = (model: AIModel) => {
        setModel(model);
        setIsOpen(false);
        setSearchQuery("");
        setHighlightedIndex(0);
    };

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 10);
        }
    }, [isOpen]);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    className="relative -mb-2 h-8 gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                >
                    <Cpu size={16} />
                    <span className="font-medium">{selectedModel}</span>
                    <ChevronDown
                        size={16}
                        className={cn(
                            "transition-transform",
                            isOpen && "rotate-180"
                        )}
                    />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-80 bg-muted p-0"
                align="end"
                sideOffset={4}
            >
                <div className="flex flex-col">
                    <div className="flex items-center border-b px-3 py-2">
                        <Search size={16} className="mr-2 text-gray-400" />
                        <Input
                            ref={inputRef}
                            placeholder="Search models..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setHighlightedIndex(0);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    const model =
                                        filteredModels[highlightedIndex];
                                    if (model && isModelEnabled(model)) {
                                        handleModelSelect(model);
                                    }
                                } else if (e.key === "ArrowDown") {
                                    e.preventDefault();
                                    setHighlightedIndex((i) =>
                                        Math.min(
                                            i + 1,
                                            filteredModels.length - 1
                                        )
                                    );
                                } else if (e.key === "ArrowUp") {
                                    e.preventDefault();
                                    setHighlightedIndex((i) =>
                                        Math.max(i - 1, 0)
                                    );
                                }
                            }}
                            className="border-0 bg-transparent p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {filteredModels.length > 0 ? (
                            <div className="p-1">
                                {filteredModels.map((model, index) => {
                                    const enabled = isModelEnabled(model);
                                    return (
                                        <Button
                                            key={model}
                                            variant="ghost"
                                            disabled={!enabled}
                                            onClick={() =>
                                                enabled &&
                                                handleModelSelect(model)
                                            }
                                            className={cn(
                                                "h-13 flex w-full items-center justify-between rounded-md px-3 text-left text-sm",
                                                index === highlightedIndex &&
                                                    "bg-accent text-accent-foreground",
                                                !enabled &&
                                                    "cursor-not-allowed opacity-50"
                                            )}
                                            ref={
                                                index === highlightedIndex
                                                    ? (el) =>
                                                          el?.scrollIntoView({
                                                              block: "nearest",
                                                          })
                                                    : null
                                            }
                                        >
                                            <span>{model}</span>
                                            {selectedModel === model && (
                                                <Check
                                                    size={16}
                                                    className="text-blue-500"
                                                />
                                            )}
                                        </Button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                No models found matching "{searchQuery}"
                            </div>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}

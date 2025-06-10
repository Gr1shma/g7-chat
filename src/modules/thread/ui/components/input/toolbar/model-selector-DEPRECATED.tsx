"use client";

import { Check, ChevronDown, Cpu, Search } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { cn } from "~/lib/utils";
import {
    getAvailableModels,
    type ValidModelString,
    type ModelInfo,
} from "~/lib/ai/providers-DEPRECATED";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "~/components/ui/popover";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

export const AVAILABLE_MODELS: readonly ModelInfo[] = getAvailableModels();

interface ModelSelectorProps {
    selectedModel: ValidModelString;
    onModelChange: (modelId: ValidModelString) => void;
}

export function ModelSelector({
    selectedModel,
    onModelChange,
}: ModelSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(0);

    const currentModel =
        AVAILABLE_MODELS.find((m) => m.id === selectedModel) ||
        AVAILABLE_MODELS[0];

    const filteredModels = useMemo(() => {
        if (!searchQuery.trim()) return AVAILABLE_MODELS;

        const query = searchQuery.toLowerCase();
        return AVAILABLE_MODELS.filter(
            (model) =>
                model.displayName.toLowerCase().includes(query) ||
                model.provider.toLowerCase().includes(query) ||
                model.model.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    useEffect(() => {
        if (!searchQuery.trim()) {
            const currentIndex = AVAILABLE_MODELS.findIndex(
                (model) => model.id === selectedModel
            );
            setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
        } else {
            setHighlightedIndex(0);
        }
    }, [searchQuery, selectedModel]);

    useEffect(() => {
        if (isOpen && !searchQuery.trim()) {
            const currentIndex = AVAILABLE_MODELS.findIndex(
                (model) => model.id === selectedModel
            );
            setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
        }
    }, [isOpen, selectedModel]);

    const handleModelSelect = (model: ModelInfo) => {
        onModelChange(model.id);
        setIsOpen(false);
        setSearchQuery("");
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            setSearchQuery("");
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    className="relative -mb-2 h-8 gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted/40 hover:text-foreground disabled:hover:bg-transparent disabled:hover:text-foreground/50"
                >
                    <Cpu size={16} />
                    <span className="font-medium">
                        {currentModel?.displayName}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({currentModel?.displayName})
                    </span>
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
                            placeholder="Search models..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    const model =
                                        filteredModels[highlightedIndex];
                                    if (model) handleModelSelect(model);
                                } else if (e.key === "ArrowDown") {
                                    e.preventDefault();
                                    setHighlightedIndex((prev) =>
                                        Math.min(
                                            prev + 1,
                                            filteredModels.length - 1
                                        )
                                    );
                                } else if (e.key === "ArrowUp") {
                                    e.preventDefault();
                                    setHighlightedIndex((prev) =>
                                        Math.max(prev - 1, 0)
                                    );
                                }
                            }}
                            className="border-0 bg-transparent p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                            autoFocus
                        />
                    </div>

                    <div className="max-h-64 overflow-y-auto">
                        {filteredModels.length > 0 ? (
                            <div className="p-1">
                                {filteredModels.map((model, index) => (
                                    <Button
                                        variant="ghost"
                                        key={model.id}
                                        onClick={() => handleModelSelect(model)}
                                        className={cn(
                                            "h-13 flex w-full items-center gap-3 rounded-md px-3 text-left text-sm",
                                            index === highlightedIndex &&
                                                "bg-accent text-accent-foreground"
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
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {model.displayName}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {model.provider}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {model.model}
                                            </div>
                                        </div>
                                        {selectedModel === model.id && (
                                            <Check
                                                size={16}
                                                className="text-blue-500"
                                            />
                                        )}
                                    </Button>
                                ))}
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

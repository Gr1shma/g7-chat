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
import {
    getAllModelsWithInfo,
    type ValidModelWithProvider,
    type ProviderName,
} from "~/lib/ai/models";
import { useAPIKeyStore } from "~/lib/ai/api-keys-store";

export function ChatModelDropdown() {
    const getKey = useAPIKeyStore((state) => state.getKey);
    const { selectedModel, setModel } = useModelStore();

    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const inputRef = useRef<HTMLInputElement | null>(null);

    const allModelsWithInfo = useMemo(() => {
        return getAllModelsWithInfo();
    }, []);

    const isModelEnabled = useCallback(
        (providerKey: string) => {
            const provider = providerKey.split(":")[0] as ProviderName;
            return !!getKey(provider);
        },
        [getKey]
    );

    const getModelDisplayName = useCallback(
        (modelKey: string) => {
            const model = allModelsWithInfo.find(
                (m) => m.providerKey === modelKey
            );
            return model?.displayName ?? modelKey;
        },
        [allModelsWithInfo]
    );

    useEffect(() => {
        if (!isModelEnabled(selectedModel)) {
            const fallback = allModelsWithInfo.find((m) =>
                isModelEnabled(m.providerKey)
            );
            setModel(
                (fallback?.providerKey as ValidModelWithProvider) ??
                    "google:gemini-2.0-flash-001"
            );
        }
    }, [selectedModel, isModelEnabled, allModelsWithInfo, setModel]);

    const filteredModels = useMemo(() => {
        return allModelsWithInfo.filter(
            (model) =>
                model.displayName
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                model.modelId
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                model.provider.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [allModelsWithInfo, searchQuery]);

    const groupedModels = useMemo(() => {
        const groups: Record<string, typeof filteredModels> = {};
        filteredModels.forEach((model) => {
            if (!groups[model.provider]) {
                groups[model.provider] = [];
            }
            groups[model.provider]!.push(model);
        });
        return groups;
    }, [filteredModels]);

    const selectedModelIndex = useMemo(() => {
        return filteredModels.findIndex(
            (model) => model.providerKey === selectedModel
        );
    }, [filteredModels, selectedModel]);

    const [highlightedIndex, setHighlightedIndex] =
        useState(selectedModelIndex);

    const handleModelSelect = (providerKey: string) => {
        setModel(providerKey as ValidModelWithProvider);
        setIsOpen(false);
        setSearchQuery("");
        setHighlightedIndex(0);
    };

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 10);
        }
    }, [isOpen]);

    useEffect(() => {
        setHighlightedIndex(Math.max(0, selectedModelIndex));
    }, [selectedModelIndex]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            const model = filteredModels[highlightedIndex];
            if (model && isModelEnabled(model.providerKey)) {
                handleModelSelect(model.providerKey);
            }
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightedIndex((i) =>
                Math.min(i + 1, filteredModels.length - 1)
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightedIndex((i) => Math.max(i - 1, 0));
        }
    };

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null; // or a loading skeleton
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    className="relative -mb-2 h-8 gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                >
                    <Cpu size={16} />
                    <span className="font-medium">
                        {getModelDisplayName(selectedModel)}
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
                className="w-96 bg-muted p-0"
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
                            onKeyDown={handleKeyDown}
                            className="border-0 bg-transparent p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {Object.keys(groupedModels).length > 0 ? (
                            <div className="p-1">
                                {Object.entries(groupedModels).map(
                                    ([provider, models]) => (
                                        <div key={provider}>
                                            <div className="px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">
                                                {provider}
                                            </div>
                                            {models.map((model) => {
                                                const globalIndex =
                                                    filteredModels.findIndex(
                                                        (m) =>
                                                            m.providerKey ===
                                                            model.providerKey
                                                    );
                                                const enabled = isModelEnabled(
                                                    model.providerKey
                                                );
                                                return (
                                                    <Button
                                                        key={model.providerKey}
                                                        variant="ghost"
                                                        disabled={!enabled}
                                                        onClick={() =>
                                                            enabled &&
                                                            handleModelSelect(
                                                                model.providerKey
                                                            )
                                                        }
                                                        className={cn(
                                                            "flex h-auto w-full flex-col items-start justify-start rounded-md px-3 py-2 text-left",
                                                            globalIndex ===
                                                                highlightedIndex &&
                                                                "bg-accent text-accent-foreground",
                                                            !enabled &&
                                                                "cursor-not-allowed opacity-50"
                                                        )}
                                                        ref={
                                                            globalIndex ===
                                                            highlightedIndex
                                                                ? (el) =>
                                                                      el?.scrollIntoView(
                                                                          {
                                                                              block: "nearest",
                                                                          }
                                                                      )
                                                                : null
                                                        }
                                                    >
                                                        <div className="flex w-full items-start justify-between gap-3">
                                                            <div className="flex min-w-0 flex-1 flex-col gap-1">
                                                                <span className="truncate text-sm font-medium">
                                                                    {
                                                                        model.displayName
                                                                    }
                                                                </span>
                                                                <span className="truncate text-xs text-muted-foreground">
                                                                    {
                                                                        model.modelId
                                                                    }
                                                                </span>
                                                            </div>
                                                            {selectedModel ===
                                                                model.providerKey && (
                                                                <Check
                                                                    size={16}
                                                                    className="flex-shrink-0 text-blue-500"
                                                                />
                                                            )}
                                                        </div>
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                    )
                                )}
                            </div>
                        ) : (
                            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                No models found matching &quot;{searchQuery}
                                &quot;
                            </div>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}

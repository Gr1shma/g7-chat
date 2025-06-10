import { create, type Mutate, type StoreApi } from "zustand";
import { persist } from "zustand/middleware";
import {
    type AIModel,
    getModelConfig,
    type ModelConfig,
} from "~/lib/ai/models";

type ModelStore = {
    selectedModel: AIModel;
    setModel: (model: AIModel) => void;
    getModelConfig: () => ModelConfig;
};

type StoreWithPersist = Mutate<
    StoreApi<ModelStore>,
    [["zustand/persist", { selectedModel: AIModel }]]
>;

export const withStorageDOMEvents = (store: StoreWithPersist) => {
    const storageEventCallback = (e: StorageEvent) => {
        if (e.key === store.persist.getOptions().name && e.newValue) {
            store.persist.rehydrate();
        }
    };

    window.addEventListener("storage", storageEventCallback);

    return () => {
        window.removeEventListener("storage", storageEventCallback);
    };
};

export const useModelStore = create<ModelStore>()(
    persist(
        (set, get) => ({
            selectedModel: "Gemini 2.5 Flash",

            setModel: (model) => {
                set({ selectedModel: model });
            },

            getModelConfig: () => {
                const { selectedModel } = get();
                return getModelConfig(selectedModel);
            },
        }),
        {
            name: "selected-model",
            partialize: (state) => ({ selectedModel: state.selectedModel }),
        }
    )
);

withStorageDOMEvents(useModelStore);

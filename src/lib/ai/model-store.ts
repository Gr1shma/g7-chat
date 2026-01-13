import { create, type Mutate, type StoreApi } from "zustand";
import { persist } from "zustand/middleware";
import {
    type ValidModelWithProvider,
    getModelConfigByKey,
    type ModelConfig,
} from "~/lib/ai/models";

type ModelStore = {
    selectedModel: ValidModelWithProvider;
    setModel: (model: ValidModelWithProvider) => void;
    getModelConfig: () => ModelConfig | undefined;
};

type StoreWithPersist = Mutate<
    StoreApi<ModelStore>,
    [["zustand/persist", { selectedModel: ValidModelWithProvider }]]
>;

export const withStorageDOMEvents = (store: StoreWithPersist) => {
    if (typeof window === "undefined") {
        // noop for SSR
        return () => {
            /* noop */
        };
    }

    const storageEventCallback = (e: StorageEvent) => {
        if (e.key === store.persist.getOptions().name && e.newValue) {
            void store.persist.rehydrate();
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
            selectedModel: "groq:llama-3.1-8b-instant",

            setModel: (model) => {
                set({ selectedModel: model });
            },

            getModelConfig: () => {
                const { selectedModel } = get();
                return getModelConfigByKey(selectedModel);
            },
        }),
        {
            name: "selected-model",
            partialize: (state) => ({ selectedModel: state.selectedModel }),
        }
    )
);

withStorageDOMEvents(useModelStore);

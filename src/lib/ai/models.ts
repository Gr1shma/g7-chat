import { type Provider } from "./store";

export const AI_MODELS = [
    "Deepseek R1 0528",
    "Deepseek V3",
    "Gemini 2.5 Flash",
    "Gemini 1.5 Flash",
    "LLaMA 3.1 8B Instant",
    "Deepseek R1 Distill LLaMA 70B",
    "GPT-4o",
    "GPT-4.1-mini",
] as const;

export type AIModel = (typeof AI_MODELS)[number];

export type ModelConfig = {
    modelId: string;
    provider: Provider;
    headerKey: string;
};

export const MODEL_CONFIGS = {
    "Deepseek R1 0528": {
        modelId: "deepseek/deepseek-r1-0528:free",
        provider: "openrouter",
        headerKey: "X-OpenRouter-API-Key",
    },
    "Deepseek V3": {
        modelId: "deepseek/deepseek-chat-v3-0324:free",
        provider: "openrouter",
        headerKey: "X-OpenRouter-API-Key",
    },
    "Gemini 2.5 Flash": {
        modelId: "gemini-2.5-flash-preview-04-17",
        provider: "google",
        headerKey: "X-Google-API-Key",
    },
    "Gemini 1.5 Flash": {
        modelId: "gemini-1.5-flash",
        provider: "google",
        headerKey: "X-Google-API-Key",
    },
    "LLaMA 3.1 8B Instant": {
        modelId: "llama-3.1-8b-instant",
        provider: "groq",
        headerKey: "Authorization",
    },
    "Deepseek R1 Distill LLaMA 70B": {
        modelId: "deepseek-r1-distill-llama-70b",
        provider: "groq",
        headerKey: "Authorization",
    },
    "GPT-4o": {
        modelId: "gpt-4o",
        provider: "openai",
        headerKey: "X-OpenAI-API-Key",
    },
    "GPT-4.1-mini": {
        modelId: "gpt-4.1-mini",
        provider: "openai",
        headerKey: "X-OpenAI-API-Key",
    },
} as const satisfies Record<AIModel, ModelConfig>;

export const getModelConfig = (modelName: AIModel): ModelConfig => {
    return MODEL_CONFIGS[modelName];
};

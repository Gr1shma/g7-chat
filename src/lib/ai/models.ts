import { type Provider } from "./api-keys-store";

export const PROVIDER_MODELS = {
    google: [
        {
            id: "gemini-2.0-flash-001",
            displayName: "Gemini 2.0 Flash",
            description:
                "Latest multimodal model with enhanced speed and capabilities",
        },
        {
            id: "gemini-1.5-flash",
            displayName: "Gemini 1.5 Flash",
            description: "Fast and efficient model for general-purpose tasks",
        },
    ],
    groq: [
        {
            id: "llama-3.1-8b-instant",
            displayName: "Llama 3.1 8B Instant",
            description: "Ultra-fast inference with Llama 3.1 8B parameters",
        },
        {
            id: "deepseek-r1-distill-llama-70b",
            displayName: "DeepSeek R1 Distill 70B",
            description: "Distilled version of DeepSeek R1 with 70B parameters",
        },
    ],
    openrouter: [
        {
            id: "deepseek/deepseek-r1-0528:free",
            displayName: "DeepSeek R1 (Free)",
            description: "Free tier access to DeepSeek R1 reasoning model",
        },
        {
            id: "deepseek/deepseek-chat-v3-0324:free",
            displayName: "DeepSeek Chat v3 (Free)",
            description: "Free tier conversational AI model",
        },
    ],
    openai: [
        {
            id: "gpt-4o",
            displayName: "GPT-4o",
            description: "OpenAI's flagship omni-modal model",
        },
        {
            id: "gpt-4.1-mini",
            displayName: "GPT-4.1 Mini",
            description: "Compact version of GPT-4.1 for efficient tasks",
        },
    ],
} as const;

export type ProviderName = keyof typeof PROVIDER_MODELS;

export type ModelInfo = {
    id: string;
    displayName: string;
    description?: string;
};

export type ValidModelString = (typeof PROVIDER_MODELS)[Provider][number]["id"];

export type ValidModelWithProvider = {
    [P in Provider]: `${P}:${(typeof PROVIDER_MODELS)[P][number]["id"]}`;
}[Provider];

export const ALL_MODELS: string[] = (
    Object.entries(PROVIDER_MODELS) as [Provider, readonly ModelInfo[]][]
).flatMap(([provider, models]) => models.map((m) => `${provider}:${m.id}`));

export type ModelConfig = {
    modelId: string;
    provider: ProviderName;
    headerKey: string;
    displayName: string;
    description?: string;
};

const PROVIDER_HEADER_KEYS: Record<Provider, string> = {
    google: "X-Google-API-Key",
    groq: "Authorization",
    openrouter: "X-OpenRouter-API-Key",
    openai: "X-OpenAI-API-Key",
} as const;

export const MODEL_CONFIGS: Record<ProviderName, ModelConfig[]> =
    Object.fromEntries(
        (Object.keys(PROVIDER_MODELS) as ProviderName[]).map((provider) => [
            provider,
            PROVIDER_MODELS[provider].map((model) => ({
                modelId: model.id,
                provider,
                headerKey: PROVIDER_HEADER_KEYS[provider],
                displayName: model.displayName,
                description: model.description,
            })),
        ])
    ) as Record<ProviderName, ModelConfig[]>;

export function getModelConfigByKey(key: ValidModelWithProvider): ModelConfig {
    const [provider, ...rest] = key.split(":") as [ProviderName, ...string[]];
    const modelId = rest.join(":");
    const configs = MODEL_CONFIGS[provider];

    if (!configs) {
        return MODEL_CONFIGS.google.find(
            (config) => config.modelId === "gemini-2.0-flash-001"
        )!;
    }

    const found = configs.find((config) => config.modelId === modelId);
    if (!found) {
        return MODEL_CONFIGS.google.find(
            (config) => config.modelId === "gemini-2.0-flash-001"
        )!;
    }

    return found;
}

export function getAllModelsWithInfo(): (ModelConfig & {
    providerKey: string;
})[] {
    return Object.entries(MODEL_CONFIGS).flatMap(([provider, configs]) =>
        configs.map((config) => ({
            ...config,
            providerKey: `${provider}:${config.modelId}`,
        }))
    );
}

export function getModelsByProvider(provider: ProviderName): ModelConfig[] {
    return MODEL_CONFIGS[provider] || [];
}

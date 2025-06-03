import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import type { LanguageModel } from "ai";

const PROVIDER_MODELS = {
    google: {
        "gemini-2.0-flash-001": google("gemini-2.0-flash-001"),
        "gemini-1.5-flash": google("gemini-1.5-flash"),
    },
    groq: {
        "llama-3.1-8b-instant": groq("llama-3.1-8b-instant"),
        "deepseek-r1-distill-llama-70b": groq("deepseek-r1-distill-llama-70b"),
    },
} as const;

export type ProviderName = keyof typeof PROVIDER_MODELS;

export type GoogleModels = keyof typeof PROVIDER_MODELS.google;
export type GroqModels = keyof typeof PROVIDER_MODELS.groq;

export type ModelsByProvider = {
    google: GoogleModels;
    groq: GroqModels;
};

export type ValidModelString = `google:${GoogleModels}` | `groq:${GroqModels}`;

export interface ModelInfo {
    readonly id: ValidModelString;
    readonly provider: Capitalize<ProviderName>;
    readonly model: string;
    readonly displayName: string;
}

export function isValidModelString(value: string): value is ValidModelString {
    const [provider, model] = value.split(":") as [string, string];

    if (!provider || !model) return false;

    return (
        provider in PROVIDER_MODELS &&
        model in PROVIDER_MODELS[provider as ProviderName]
    );
}

/**
 * Get an AI model instance based on provider:model format (Type-Safe)
 * @param modelString - Typed format: "provider:model-name"
 * @returns The AI model instance
 */
export function AIProvider<T extends ValidModelString>(
    modelString: T
): LanguageModel {
    if (!isValidModelString(modelString)) {
        throw new Error(`Invalid model string: ${modelString}`);
    }

    const [provider, model] = modelString.split(":") as [
        ProviderName,
        ModelsByProvider[ProviderName],
    ];

    return PROVIDER_MODELS[provider][
        model as keyof (typeof PROVIDER_MODELS)[typeof provider]
    ];
}

/**
 * Runtime-safe version that accepts any string but validates it
 * Use this when you can't guarantee the input type at compile time
 */
export function AIProviderSafe(modelString: string): LanguageModel | null {
    if (!isValidModelString(modelString)) {
        return null;
    }

    return AIProvider(modelString);
}

/**
 * Get the default model (type-safe)
 */
export function getDefaultModel(): LanguageModel {
    return AIProvider("google:gemini-2.0-flash-001");
}

/**
 * Get the default model string (type-safe)
 */
export function getDefaultModelString(): ValidModelString {
    return "google:gemini-2.0-flash-001";
}

/**
 * Get all available models in a structured format (type-safe)
 */
export function getAvailableModels(): readonly ModelInfo[] {
    const models: ModelInfo[] = [];

    (Object.keys(PROVIDER_MODELS) as ProviderName[]).forEach((provider) => {
        (
            Object.keys(
                PROVIDER_MODELS[provider]
            ) as ModelsByProvider[typeof provider][]
        ).forEach((model) => {
            const modelString = `${provider}:${model}` as ValidModelString;
            models.push({
                id: modelString,
                provider: (provider.charAt(0).toUpperCase() +
                    provider.slice(1)) as Capitalize<ProviderName>,
                model: model as string,
                displayName: formatModelDisplayName(model as string),
            });
        });
    });

    return models as readonly ModelInfo[];
}

/**
 * Format model name for display (type-safe)
 */
function formatModelDisplayName(model: string): string {
    const nameMap: Readonly<Record<string, string>> = {
        "gemini-2.0-flash-001": "Gemini 2.0 Flash",
        "gemini-1.5-flash": "Gemini 1.5 Flash",

        "llama-3.1-8b-instant": "Llama 3.1 8B Instant",
        "deepseek-r1-distill-llama-70b": "Deepseek R1 70B",
    } as const;

    return nameMap[model] || model;
}

/**
 * Get model info from model string (type-safe)
 */
export function getModelInfo<T extends ValidModelString>(
    modelString: T
): ModelInfo | null {
    if (!isValidModelString(modelString)) {
        return null;
    }

    const [provider, model] = modelString.split(":") as [ProviderName, string];

    return {
        id: modelString,
        provider: (provider.charAt(0).toUpperCase() +
            provider.slice(1)) as Capitalize<ProviderName>,
        model,
        displayName: formatModelDisplayName(model),
    };
}

/**
 * Parse a model string into its components (type-safe)
 */
export function parseModelString<T extends ValidModelString>(
    modelString: T
): { provider: ProviderName; model: ModelsByProvider[ProviderName] } {
    const [provider, model] = modelString.split(":") as [
        ProviderName,
        ModelsByProvider[ProviderName],
    ];

    return { provider, model };
}

export const VALID_MODELS = {
    GOOGLE: {
        GEMINI_2_FLASH: "google:gemini-2.0-flash-001",
        GEMINI_1_5_FLASH: "google:gemini-1.5-flash",
    },
    GROQ: {
        LLAMA_3_1_8B: "groq:llama-3.1-8b-instant",
        DEEPSEEK_R1_LLAMA_30B: "groq:deepseek-r1-distill-llama-70b",
    },
} as const satisfies Record<string, Record<string, ValidModelString>>;

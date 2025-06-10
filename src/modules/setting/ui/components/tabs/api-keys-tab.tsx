"use client";

import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

import { useAPIKeyStore } from "~/lib/ai/api-keys-store";
import Link from "next/link";

const formSchema = z.object({
    google: z.string().trim().optional(),
    groq: z.string().trim().optional(),
    openrouter: z.string().trim().optional(),
    openai: z.string().trim().optional(),
}).refine((data) => {
    const hasAtLeastOneKey = Object.values(data).some(value => value && value.length > 0);
    return hasAtLeastOneKey;
}, {
    message: "At least one API key is required",
    path: ["root"],
});

type FormValues = z.infer<typeof formSchema>;

const apiKeyFields: {
    id: keyof FormValues;
    label: string;
    placeholder: string;
    linkUrl: string;
}[] = [
    {
        id: "google",
        label: "Google API Key",
        placeholder: "AIza...",
        linkUrl: "https://aistudio.google.com/apikey",
    },
    {
        id: "groq",
        label: "Groq Api Key",
        placeholder: "gsk_...",
        linkUrl: "https://console.groq.com/keys",
    },
    {
        id: "openrouter",
        label: "OpenRouter API Key",
        placeholder: "sk-or-...",
        linkUrl: "https://openrouter.ai/settings/keys",
    },
    {
        id: "openai",
        label: "OpenAI API Key",
        placeholder: "sk-...",
        linkUrl: "https://platform.openai.com/settings/organization/api-keys",
    },
];

export default function APIKeyForm() {
    const { keys, setKeys } = useAPIKeyStore();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: keys,
    });

    useEffect(() => {
        form.reset(keys);
    }, [keys, form]);

    function onSubmit(values: FormValues) {
        setKeys(values);
        toast.success("API keys saved successfully");
    }

    return (
        <>
            <h2 className="text-2xl font-bold">API Key Settings</h2>
            <span className="text-sm text-muted-foreground">
                All the keys are stored locally in your browser. Fill at least one key
                to use g7-chat.
                <br/>
                Signing out will clear the keys too.
            </span>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8"
                    autoComplete="off"
                >
                    {form.formState.errors.root && (
                        <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800">
                            {form.formState.errors.root.message}
                        </div>
                    )}
                    
                    {apiKeyFields.map((fieldConfig) => (
                        <FormField
                            key={fieldConfig.id}
                            control={form.control}
                            name={fieldConfig.id}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base text-foreground">
                                        {fieldConfig.label}
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={fieldConfig.placeholder}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        <Link
                                            href={fieldConfig.linkUrl}
                                            target="_blank"
                                            className="text-sm text-pink-500"
                                        >
                                            Create {fieldConfig.label}
                                        </Link>
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ))}
                    <div className="flex flex-row items-center justify-end gap-2">
                        <Button
                            type="submit"
                            disabled={!form.formState.isDirty}
                        >
                            Save API Keys
                        </Button>
                    </div>
                </form>
            </Form>
        </>
    );
}

"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "~/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/trpc/react";
import { type DB_USER_TYPE } from "~/server/db/schema";
import { useToast } from "~/hooks/use-toast";

const customizationFormSchema = z.object({
    name: z.string(),
    whatDoYouDo: z.string(),
    chatTraits: z.string(),
    keepInMind: z.string(),
});

export default function CustomizationTab({ user }: { user: DB_USER_TYPE }) {
    const { toast } = useToast();
    const form = useForm<z.infer<typeof customizationFormSchema>>({
        resolver: zodResolver(customizationFormSchema),
        defaultValues: {
            name: user.customization.name,
            whatDoYouDo: user.customization.whatDoYouDo,
            chatTraits: user.customization.chatTraits,
            keepInMind: user.customization.keepInMind,
        },
    });

    const userMutation = api.user.addCustomization.useMutation();
    function onSubmit(values: z.infer<typeof customizationFormSchema>) {
        userMutation.mutate({
            name: values.name,
            chatTraits: values.chatTraits,
            keepInMind: values.keepInMind,
            whatDoYouDo: values.whatDoYouDo,
        });
        toast({
            description: "Submtted",
        });
    }

    return (
        <>
            <h2 className="text-2xl font-bold">Customize g7-chat</h2>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8"
                    autoComplete="off"
                >
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-base">
                                    What should g7-chat call you?
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter your name"
                                        {...field}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="whatDoYouDo"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-base">
                                    What do you do?
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enginner, Student, teacher, etc"
                                        {...field}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="chatTraits"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-base">
                                    What traits should g7-chat have?
                                </FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Enter traits separated by commas (e.g. Chatty, Witty, Opinionated)"
                                        {...field}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="keepInMind"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-base">
                                    Anything else g7-chat should know about you?
                                </FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Interests, values, or preferences to keep in mind"
                                        {...field}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <div className="flex flex-row items-center justify-end gap-2">
                        <Button type="submit">Submit</Button>
                    </div>
                </form>
            </Form>
        </>
    );
}

"use client";

import { useEffect, useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { useToast } from "~/hooks/use-toast";
import { type DB_THREAD_TYPE } from "~/server/db/schema";
import { api } from "~/trpc/react";

export function ThreadShareDialog({
    thread,
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    thread: DB_THREAD_TYPE;
}) {
    const [visibility, setVisibility] = useState(thread.visibility);
    useEffect(() => {
        setVisibility(thread.visibility);
    }, [thread.visibility]);

    const { toast } = useToast();
    const utils = api.useUtils();
    const toggleVisibilityMutation =
        api.thread.toogleThreadVisibility.useMutation({
            onSuccess: async () => {
                const newVisibility =
                    visibility === "private" ? "public" : "private";
                setVisibility(newVisibility);
                if (newVisibility === "public") {
                    const url = `${window.location.origin}/chat/${thread.id}`;
                    try {
                        await navigator.clipboard.writeText(url);
                        toast({
                            title: "Thread is now public",
                            description: "Shareable link copied to clipboard.",
                        });
                    } catch {
                        toast({
                            title: "Copied manually",
                            description: `Link: ${url}`,
                            variant: "default",
                        });
                    }
                }
                if (newVisibility === "private") {
                    toast({
                        description: "Thread is now private",
                    });
                }
                await utils.thread.getInfiniteThreads.invalidate();
                await utils.project.getAllProjects.invalidate();
                onOpenChange(false);
            },
            onError: () => {
                toast({
                    title: "Error",
                    description: "Failed to toggle thread visibility.",
                    variant: "destructive",
                });
            },
        });

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Confirm Visibility Change
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This will set the thread to{" "}
                        <strong>
                            {visibility === "public" ? "private" : "public"}
                        </strong>
                        .{" "}
                        {visibility === "private"
                            ? "Others will be able to view and access it via link."
                            : "It will no longer be accessible to others."}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        type="button"
                        onClick={() =>
                            toggleVisibilityMutation.mutate(thread.id)
                        }
                        disabled={toggleVisibilityMutation.isPending}
                    >
                        {toggleVisibilityMutation.isPending
                            ? "Saving..."
                            : "Confirm"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

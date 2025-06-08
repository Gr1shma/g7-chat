"use client";

import { type Dispatch, type SetStateAction } from "react";
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
import { api } from "~/trpc/react";
import { useParams, useRouter } from "next/navigation";
import type { ProjectWithThreads } from "../thread-sidebar-group";

interface DeleteProjectAlertDialogProps {
    projectId: string | null;
    isAlertDialogOpen: boolean;
    setIsAlertDialogOpen: Dispatch<SetStateAction<boolean>>;
    projectWithThreads: ProjectWithThreads[];
}

export function DeleteProjectAlertDialog({
    projectId,
    isAlertDialogOpen,
    setIsAlertDialogOpen,
    projectWithThreads,
}: DeleteProjectAlertDialogProps) {
    const utils = api.useUtils();
    const router = useRouter();
    const { threadId } = useParams();
    const project = projectWithThreads.find((p) => p.id === projectId);

    const deleteMutation = api.project.deleteProject.useMutation({
        onSuccess: async () => {
            await utils.project.getAllProjects.invalidate();
            await utils.thread.getInfiniteThreads.invalidate({ limit: 20 });

            const deletedThreadIds = project?.threads.map((t) => t.id) ?? [];

            if (
                typeof threadId === "string" &&
                deletedThreadIds.includes(threadId)
            ) {
                router.push("/chat");
            }
        },
    });

    const handleDelete = async () => {
        if (projectId) {
            await deleteMutation.mutateAsync({ projectId });
            setIsAlertDialogOpen(false);
        }
    };

    return (
        <AlertDialog
            open={isAlertDialogOpen}
            onOpenChange={setIsAlertDialogOpen}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete{" "}
                        <span className="font-extrabold">
                            "{project?.title}"
                        </span>{" "}
                        project and all its threads and messages.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction type="button" onClick={handleDelete}>
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

"use client";

import { type Dispatch, type SetStateAction, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

interface CreateNewProjectDialogProps {
    isDialogOpen: boolean;
    setIsDialogOpen: Dispatch<SetStateAction<boolean>>;
}

export function CreateNewProjectDialog({
    isDialogOpen,
    setIsDialogOpen,
}: CreateNewProjectDialogProps) {
    const [newProjectTitle, setNewProjectTitle] = useState("");
    const utils = api.useUtils();

    const projectMutation = api.project.createProject.useMutation({
        onSuccess: async () => {
            await utils.project.getAllProjects.invalidate();
            await utils.thread.getInfiniteThreads.invalidate({ limit: 20 });
            setIsDialogOpen(false);
            setNewProjectTitle("");
        },
    });

    const handleCreateProject = async () => {
        if (newProjectTitle.trim()) {
            await projectMutation.mutateAsync({
                title: newProjectTitle.trim(),
            });
        }
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                    <Input
                        placeholder="Project title"
                        value={newProjectTitle}
                        onChange={(e) => setNewProjectTitle(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                void handleCreateProject();
                            }
                        }}
                    />
                    <Button
                        onClick={handleCreateProject}
                        disabled={projectMutation.isPending}
                    >
                        {projectMutation.isPending ? "Creating..." : "Create"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

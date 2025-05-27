"use client";

import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import {
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupContent,
    SidebarGroupLabel,
} from "~/components/ui/sidebar";
import {
    Collapsible,
    CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { api } from "~/trpc/react";
import { ErrorBoundary } from "react-error-boundary";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Suspense } from "react";

export default function ProjectSection() {
    return (
        <Suspense fallback={<p>Fetching Projects...</p>}>
            <ErrorBoundary fallback={<p>Error while fetching projects.</p>}>
                <Project />
            </ErrorBoundary>
        </Suspense>
    );
}

function Project() {
    const [fetchedProjects] = api.project.getAllProjects.useSuspenseQuery();

    const utils = api.useUtils();
    const projectMutation = api.project.createProject.useMutation({
        onSuccess: async () => {
            await utils.project.getAllProjects.invalidate();
            setIsDialogOpen(false);
            setNewProjectTitle("");
        },
    });

    const [openProjects, setOpenProjects] = useState<Record<string, boolean>>({});
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newProjectTitle, setNewProjectTitle] = useState("");

    const toggleProject = (projectId: string) => {
        setOpenProjects((prev) => ({
            ...prev,
            [projectId]: !prev[projectId],
        }));
    };

    const handleCreateProject = async () => {
        if (newProjectTitle.trim()) {
            await projectMutation.mutateAsync({
                title: newProjectTitle.trim(),
            });
        }
    };

    return (
        <>
            <Collapsible className="group/collapsible">
                <SidebarGroup>
                    <SidebarGroupLabel>Projects</SidebarGroupLabel>

                    <SidebarGroupAction
                        title="Add Project"
                        onClick={() => setIsDialogOpen(true)}
                    >
                        <Plus />
                        <span className="sr-only">Add Project</span>
                    </SidebarGroupAction>

                    <SidebarGroupContent className="flex flex-col gap-1 px-1 py-2">
                        {fetchedProjects.map((project) => {
                            const isOpen = openProjects[project.id];

                            return (
                                <div key={project.id}>
                                    <CollapsibleTrigger
                                        onClick={() => toggleProject(project.id)}
                                        className="flex items-center justify-between w-full px-2 py-1 text-sm text-left rounded-md hover:bg-muted transition"
                                    >
                                        <span>{project.title}</span>
                                        <ChevronDown
                                            className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                                        />
                                    </CollapsibleTrigger>

                                    {isOpen && project.threadId.length > 0 && (
                                        <div className="ml-4 mt-1 flex flex-col gap-1">
                                            {project.threadId.map((threadId) => (
                                                <div
                                                    key={threadId}
                                                    className="text-xs text-muted-foreground px-2 py-1 rounded hover:bg-muted/50 transition"
                                                >
                                                    {threadId}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </SidebarGroupContent>
                </SidebarGroup>
            </Collapsible>

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
                                    handleCreateProject();
                                }
                            }}
                        />
                        <Button onClick={handleCreateProject} disabled={projectMutation.isPending}>
                            {projectMutation.isPending ? "Creating..." : "Create"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

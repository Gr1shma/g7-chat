"use client";

import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import {
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupContent,
    SidebarGroupLabel,
    useSidebar,
} from "~/components/ui/sidebar";
import { Collapsible, CollapsibleTrigger } from "~/components/ui/collapsible";
import { api } from "~/trpc/react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import type { ProjectWithThreads } from "../thread-sidebar-group";
import { ThreadItem } from "../thread-item";

interface ProjectSecionProps {
    threadId: string | undefined;
    projectWithThreads: ProjectWithThreads[];
    searchQuery: string;
}

export function ProjectSection({
    projectWithThreads,
    threadId,
    searchQuery,
}: ProjectSecionProps) {
    const [openProjects, setOpenProjects] = useState<Record<string, boolean>>(
        {}
    );
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const toggleProject = (projectId: string) => {
        setOpenProjects((prev) => ({
            ...prev,
            [projectId]: !prev[projectId],
        }));
    };

    const { setOpenMobile } = useSidebar();

    useEffect(() => {
        if (!projectWithThreads) return;

        const normalizedQuery = searchQuery?.toLowerCase().trim() || "";
        const isSearchEmpty = !normalizedQuery;
        const newOpenProjects: Record<string, boolean> = {};

        for (const project of projectWithThreads) {
            const hasActiveThread =
                threadId && typeof threadId === "string"
                    ? project.threads.some((thread) => thread.id === threadId)
                    : false;

            if (isSearchEmpty) {
                // When search is empty, only open projects with active threads
                newOpenProjects[project.id] = hasActiveThread;
            } else {
                // When searching, open projects that have matching threads
                const hasMatchingThread = project.threads.some((thread) =>
                    thread.title?.toLowerCase().includes(normalizedQuery)
                );
                if (hasMatchingThread) {
                    newOpenProjects[project.id] = true;
                }
            }
        }

        setOpenProjects(newOpenProjects);
    }, [threadId, projectWithThreads, searchQuery]);

    // Filter projects based on search query
    const getFilteredProjects = () => {
        if (!projectWithThreads) return [];

        const normalizedQuery = searchQuery?.toLowerCase().trim() || "";
        const isSearchEmpty = !normalizedQuery;

        if (isSearchEmpty) {
            // Show all projects when search is empty
            return projectWithThreads;
        } else {
            // Only show projects that have threads matching the search query
            return projectWithThreads.filter((project) =>
                project.threads.some((thread) =>
                    thread.title?.toLowerCase().includes(normalizedQuery)
                )
            );
        }
    };

    const filteredProjects = getFilteredProjects();

    if (!projectWithThreads || filteredProjects.length === 0) {
        return <></>;
    }

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
                        {filteredProjects.map((project) => {
                            const isOpen = openProjects[project.id] || false;

                            return (
                                <div key={project.id}>
                                    <CollapsibleTrigger
                                        onClick={() =>
                                            toggleProject(project.id)
                                        }
                                        className="flex w-full items-center justify-between rounded-md px-2 py-1 text-left text-sm transition hover:bg-muted"
                                    >
                                        <span>{project.title}</span>
                                        <ChevronDown
                                            className={`h-4 w-4 text-muted-foreground transition-transform ${
                                                isOpen ? "rotate-180" : ""
                                            }`}
                                        />
                                    </CollapsibleTrigger>

                                    {isOpen && (
                                        <div className="ml-3 mt-1 flex flex-col gap-1">
                                            {project.threads.map((thread) => (
                                                <ThreadItem
                                                    projectWithThreads={
                                                        projectWithThreads
                                                    }
                                                    key={thread.id}
                                                    thread={thread}
                                                    isActive={
                                                        thread.id === threadId
                                                    }
                                                    setOpenMobile={
                                                        setOpenMobile
                                                    }
                                                    isProjectItem={true}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </SidebarGroupContent>
                </SidebarGroup>
            </Collapsible>

            <CreateNewProjectDailog
                isDialogOpen={isDialogOpen}
                setIsDialogOpen={setIsDialogOpen}
            />
        </>
    );
}

function CreateNewProjectDailog({
    isDialogOpen,
    setIsDialogOpen,
}: {
    isDialogOpen: boolean;
    setIsDialogOpen: Dispatch<SetStateAction<boolean>>;
}) {
    const [newProjectTitle, setNewProjectTitle] = useState("");

    const utils = api.useUtils();
    const projectMutation = api.project.createProject.useMutation({
        onSuccess: async () => {
            await utils.project.getAllProjects.invalidate();
            await utils.thread.getInfiniteThreads.invalidate();
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
                                handleCreateProject();
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

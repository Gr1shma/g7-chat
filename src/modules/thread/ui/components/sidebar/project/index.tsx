"use client";

import { useEffect, useState, useRef } from "react";
import {
    CheckIcon,
    ChevronDown,
    EllipsisIcon,
    Plus,
    Trash2,
    XIcon,
} from "lucide-react";
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import type { ProjectWithThreads } from "../thread-sidebar-group";
import { ThreadItem } from "../thread-item";
import type { DB_THREAD_TYPE } from "~/server/db/schema";
import { CreateNewProjectDialog } from "./project-create-dailog";
import { DeleteProjectAlertDialog } from "./project-delete-alert-dailog";

interface ProjectSectionProps {
    threadId: string | undefined;
    projectWithThreads: ProjectWithThreads[];
    searchQuery: string;
    navigatingToId: string | null;
    activeThreadProjectId: string | null;
    onThreadSelect: (thread: DB_THREAD_TYPE) => void;
}

export function ProjectSection({
    projectWithThreads,
    threadId,
    searchQuery,
    navigatingToId,
    activeThreadProjectId,
    onThreadSelect,
}: ProjectSectionProps) {
    const [openProjects, setOpenProjects] = useState<Record<string, boolean>>(
        {}
    );
    const [manuallyOpenedProjects, setManuallyOpenedProjects] = useState<
        Record<string, boolean>
    >({});
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
        null
    );
    const [editingProjectId, setEditingProjectId] = useState<string | null>(
        null
    );
    const [editedTitle, setEditedTitle] = useState("");

    const utils = api.useUtils();

    const changeTitle = api.project.changeProjectTitle.useMutation({
        onSuccess: async () => {
            await utils.project.getAllProjects.invalidate();
            await utils.thread.getInfiniteThreads.invalidate({ limit: 20 });
            setEditingProjectId(null);
            setEditedTitle("");
        },
    });

    const { setOpenMobile } = useSidebar();

    const toggleProject = (projectId: string) => {
        setOpenProjects((prev) => ({
            ...prev,
            [projectId]: !prev[projectId],
        }));
        setManuallyOpenedProjects((prev) => ({
            ...prev,
            [projectId]: !openProjects[projectId],
        }));
    };

    const isThreadActive = (thread: DB_THREAD_TYPE): boolean => {
        if (navigatingToId === thread.id) {
            return true;
        }
        if (navigatingToId && navigatingToId !== thread.id) {
            return false;
        }
        return thread.id === threadId;
    };

    useEffect(() => {
        if (!projectWithThreads || !threadId) return;

        setOpenProjects((prevOpenProjects) => {
            const newOpenProjects: Record<string, boolean> = {
                ...prevOpenProjects,
            };

            for (const project of projectWithThreads) {
                const hasActiveThread = project.threads.some(
                    (thread) => thread.id === threadId
                );
                const isActiveProject = project.id === activeThreadProjectId;
                const manualState = manuallyOpenedProjects[project.id];

                if (
                    (hasActiveThread || isActiveProject) &&
                    manualState !== false
                ) {
                    newOpenProjects[project.id] = true;
                }
            }

            return newOpenProjects;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [threadId, activeThreadProjectId]);

    useEffect(() => {
        if (!projectWithThreads) return;

        const normalizedQuery = searchQuery?.toLowerCase().trim() || "";

        if (normalizedQuery) {
            setOpenProjects(() => {
                const newOpenProjects: Record<string, boolean> = {};

                for (const project of projectWithThreads) {
                    const hasMatchingThread = project.threads.some((thread) =>
                        thread.title?.toLowerCase().includes(normalizedQuery)
                    );
                    newOpenProjects[project.id] = hasMatchingThread;
                }

                return newOpenProjects;
            });
        } else {
            setOpenProjects(() => {
                const newOpenProjects: Record<string, boolean> = {};

                for (const project of projectWithThreads) {
                    const hasActiveThread = project.threads.some(
                        (thread) => thread.id === threadId
                    );
                    const isActiveProject =
                        project.id === activeThreadProjectId;
                    const manualState = manuallyOpenedProjects[project.id];

                    if (manualState !== undefined) {
                        newOpenProjects[project.id] = manualState;
                    } else {
                        newOpenProjects[project.id] =
                            hasActiveThread || isActiveProject;
                    }
                }

                return newOpenProjects;
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    const getFilteredProjects = () => {
        if (!projectWithThreads) return [];

        const normalizedQuery = searchQuery?.toLowerCase().trim() || "";
        const isSearchEmpty = !normalizedQuery;

        if (isSearchEmpty) {
            return projectWithThreads;
        } else {
            return projectWithThreads.filter((project) =>
                project.threads.some((thread) =>
                    thread.title?.toLowerCase().includes(normalizedQuery)
                )
            );
        }
    };

    const filteredProjects = getFilteredProjects();

    const handleProjectTitleSave = async (projectId: string) => {
        const trimmed = editedTitle.trim();
        if (!trimmed) {
            cancelEditing();
            return;
        }

        if (
            trimmed !==
            projectWithThreads.find((p) => p.id === projectId)?.title
        ) {
            await changeTitle.mutateAsync({
                projectId,
                title: trimmed,
            });
        } else {
            cancelEditing();
        }
    };

    const cancelEditing = () => {
        setEditingProjectId(null);
        setEditedTitle("");
    };

    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (editingProjectId && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingProjectId]);

    if (!projectWithThreads) {
        return <></>;
    }

    const normalizedQuery = searchQuery?.toLowerCase().trim() || "";
    if (normalizedQuery && filteredProjects.length === 0) {
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
                            const isOpen = openProjects[project.id] ?? false;

                            return (
                                <div key={project.id}>
                                    {editingProjectId === project.id ? (
                                        <div className="relative w-full">
                                            <Input
                                                ref={inputRef}
                                                value={editedTitle}
                                                onChange={(e) =>
                                                    setEditedTitle(
                                                        e.target.value
                                                    )
                                                }
                                                onBlur={() =>
                                                    void handleProjectTitleSave(
                                                        project.id
                                                    )
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter")
                                                        void handleProjectTitleSave(
                                                            project.id
                                                        );
                                                    if (e.key === "Escape")
                                                        cancelEditing();
                                                }}
                                                className="w-full rounded-sm bg-muted px-2 py-1 pr-20 text-sm font-medium text-foreground"
                                            />

                                            <div className="absolute right-2 top-1/2 flex -translate-y-1/2 space-x-0.5">
                                                <Button
                                                    variant="ghost"
                                                    onClick={() =>
                                                        handleProjectTitleSave(
                                                            project.id
                                                        )
                                                    }
                                                    className="rounded-sm bg-muted/80 p-1 hover:bg-muted hover:text-sidebar-accent-foreground"
                                                    aria-label="Save title"
                                                >
                                                    <CheckIcon className="size-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    onClick={cancelEditing}
                                                    className="rounded-sm bg-muted/80 p-1 hover:bg-muted hover:text-sidebar-accent-foreground"
                                                    aria-label="Cancel editing"
                                                >
                                                    <XIcon className="size-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <CollapsibleTrigger
                                            onClick={() =>
                                                toggleProject(project.id)
                                            }
                                            onDoubleClick={() => {
                                                setEditingProjectId(project.id);
                                                setEditedTitle(project.title);
                                            }}
                                            className="flex w-full cursor-pointer items-center justify-between rounded-md px-2 py-1 text-left text-sm"
                                        >
                                            <span>{project.title}</span>
                                            <div className="flex flex-row gap-2">
                                                {isOpen ? (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <EllipsisIcon className="flex size-6 items-center justify-center rounded-md p-1 outline-none transition-colors hover:bg-muted/90" />
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent className="w-48 border-border bg-secondary shadow-lg">
                                                            <DropdownMenuLabel>
                                                                {project.title}
                                                            </DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onSelect={() => {
                                                                    setSelectedProjectId(
                                                                        project.id
                                                                    );
                                                                    setIsAlertDialogOpen(
                                                                        true
                                                                    );
                                                                }}
                                                                className="flex cursor-pointer items-center gap-3 bg-destructive/40 px-3 py-2 text-sm"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                                <span>
                                                                    Delete
                                                                    Project
                                                                </span>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                ) : (
                                                    <ChevronDown
                                                        className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen
                                                            ? "rotate-180"
                                                            : ""
                                                            }`}
                                                    />
                                                )}
                                            </div>
                                        </CollapsibleTrigger>
                                    )}
                                    {isOpen && (
                                        <div className="ml-3 mt-1 flex flex-col gap-1">
                                            {project.threads.map((thread) => (
                                                <ThreadItem
                                                    projectWithThreads={
                                                        projectWithThreads
                                                    }
                                                    key={thread.id}
                                                    thread={thread}
                                                    isActive={isThreadActive(
                                                        thread
                                                    )}
                                                    setOpenMobile={
                                                        setOpenMobile
                                                    }
                                                    isProjectItem={true}
                                                    onThreadSelect={
                                                        onThreadSelect
                                                    }
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

            <CreateNewProjectDialog
                isDialogOpen={isDialogOpen}
                setIsDialogOpen={setIsDialogOpen}
            />
            <DeleteProjectAlertDialog
                projectId={selectedProjectId}
                isAlertDialogOpen={isAlertDialogOpen}
                setIsAlertDialogOpen={setIsAlertDialogOpen}
                projectWithThreads={projectWithThreads}
            />
        </>
    );
}

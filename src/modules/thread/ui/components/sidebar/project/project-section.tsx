"use client";

import {
    type Dispatch,
    type SetStateAction,
    useEffect,
    useState,
    useRef,
} from "react";
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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "~/components/ui/dialog";
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
import { useParams, useRouter } from "next/navigation";

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
    const [isAlertDailogOpen, setIsAlertDialogOpen] = useState(false);
    const [selectedProjectId, _setSelectedProjectId] = useState<string | null>(
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
            setEditingProjectId(null);
            setEditedTitle("");
        },
    });

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
                newOpenProjects[project.id] = hasActiveThread;
            } else {
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
                                                    handleProjectTitleSave(
                                                        project.id
                                                    )
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter")
                                                        handleProjectTitleSave(
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
                                                        className={`h-4 w-4 text-muted-foreground transition-transform ${
                                                            isOpen
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
            <DeleteProjectAlertDailog
                projectId={selectedProjectId}
                isAlertDialogOpen={isAlertDailogOpen}
                setIsAlertDialogOpen={setIsAlertDialogOpen}
                projectWithThreads={projectWithThreads}
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

function DeleteProjectAlertDailog({
    projectId,
    isAlertDialogOpen,
    setIsAlertDialogOpen,
    projectWithThreads,
}: {
    projectId: string | null;
    isAlertDialogOpen: boolean;
    setIsAlertDialogOpen: Dispatch<SetStateAction<boolean>>;
    projectWithThreads: ProjectWithThreads[];
}) {
    const utils = api.useUtils();
    const router = useRouter();
    const { threadId } = useParams();
    const project = projectWithThreads.find((p) => p.id === projectId);
    const deleteMutation = api.project.deleteProject.useMutation({
        onSuccess: async () => {
            await utils.project.getAllProjects.invalidate();
            await utils.thread.getInfiniteThreads.invalidate();

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

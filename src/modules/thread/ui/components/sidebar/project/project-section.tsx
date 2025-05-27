import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import {
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupContent,
    SidebarGroupLabel,
} from "~/components/ui/sidebar";
import { Collapsible, CollapsibleTrigger } from "~/components/ui/collapsible";

const mockThreads = () =>
    Array.from({ length: Math.floor(Math.random() * 4) + 1 }, (_, i) => ({
        id: `thread-${Math.random().toString(36).slice(2)}`,
        title: `Thread ${i + 1}`,
    }));

export function ProjectSection() {
    const projects = ["Project Alpha", "Project Beta", "Project Gamma"];
    const [openProjects, setOpenProjects] = useState<Record<string, boolean>>({});
    const [threadsByProject, setThreadsByProject] = useState<Record<string, { id: string; title: string }[]>>({});

    const toggleProject = (projectName: string) => {
        setOpenProjects((prev) => ({
            ...prev,
            [projectName]: !prev[projectName],
        }));

        if (!threadsByProject[projectName]) {
            setThreadsByProject((prev) => ({
                ...prev,
                [projectName]: mockThreads(),
            }));
        }
    };

    return (
        <Collapsible className="group/collapsible">
            <SidebarGroup>
                <SidebarGroupLabel>Projects</SidebarGroupLabel>

                <SidebarGroupAction
                    title="Add Project"
                    onClick={() => console.log("hello world")}
                >
                    <Plus />
                    <span className="sr-only">Add Project</span>
                </SidebarGroupAction>

                <SidebarGroupContent className="flex flex-col gap-1 px-1 py-2">
                    {projects.map((project) => {
                        const isOpen = openProjects[project];
                        const threads = threadsByProject[project] || [];

                        return (
                            <div key={project}>
                                {/* Project Button */}
                                <CollapsibleTrigger
                                    onClick={() => toggleProject(project)}
                                    className="flex items-center justify-between w-full px-2 py-1 text-sm text-left rounded-md hover:bg-muted transition"
                                >
                                    <span>{project}</span>
                                    <ChevronDown
                                        className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""
                                            }`}
                                    />
                                </CollapsibleTrigger>

                                {isOpen && (
                                    <div className="ml-4 mt-1 flex flex-col gap-1">
                                        {threads.map((thread) => (
                                            <div
                                                key={thread.id}
                                                className="text-xs text-muted-foreground px-2 py-1 rounded hover:bg-muted/50 transition"
                                            >
                                                {thread.title}
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
    );
}

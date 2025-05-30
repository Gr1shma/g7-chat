import {
    CommandDialog,
    CommandInput,
    CommandList,
    CommandGroup,
    CommandItem,
    CommandEmpty,
} from "~/components/ui/command";
import type { ProjectWithThreads } from "../thread-sidebar-group";
import { type Dispatch, type SetStateAction } from "react";
import { DialogTitle } from "~/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { api } from "~/trpc/react";

export function MoveToProjectCommand({
    threadId,
    showMoveProjectCommand,
    setShowMoveProjectCommand,
    projectWithThreads,
}: {
    threadId: string;
    showMoveProjectCommand: boolean;
    projectWithThreads: ProjectWithThreads[];
    setShowMoveProjectCommand: Dispatch<SetStateAction<boolean>>;
}) {
    const utils = api.useUtils();
    const changeProjectMutation = api.thread.changeThreadProjectId.useMutation({
        onSuccess: async () => {
            setShowMoveProjectCommand(false);
            utils.thread.getInfiniteThreads.invalidate();
            utils.project.getAllProjects.invalidate();
        },
    });
    return (
        <CommandDialog
            open={showMoveProjectCommand}
            onOpenChange={setShowMoveProjectCommand}
        >
            <CommandInput placeholder="Search project..." />
            <CommandList>
                <VisuallyHidden>
                    <DialogTitle />
                </VisuallyHidden>
                <CommandEmpty>No project found.</CommandEmpty>
                <CommandGroup heading="Projects">
                    {projectWithThreads
                        .filter(
                            (project) =>
                                !project.threads.some(
                                    (thread) => thread.id === threadId
                                )
                        )
                        .map((project) => (
                            <CommandItem
                                key={project.id}
                                onSelect={() => {
                                    changeProjectMutation.mutate({
                                        projectId: project.id,
                                        threadId,
                                    });
                                }}
                            >
                                {project.title}
                            </CommandItem>
                        ))}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}

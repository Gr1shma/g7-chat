import {
    CommandDialog,
    CommandInput,
    CommandList,
    CommandGroup,
    CommandItem,
    CommandEmpty,
} from "~/components/ui/command";
import { type Dispatch, type SetStateAction } from "react";
import { DialogTitle } from "~/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { api } from "~/trpc/react";
import { type DB_THREAD_TYPE } from "~/server/db/schema";

export function MoveToProjectCommand({
    thread,
    showMoveProjectCommand,
    setShowMoveProjectCommand,
}: {
    thread: DB_THREAD_TYPE;
    showMoveProjectCommand: boolean;
    setShowMoveProjectCommand: Dispatch<SetStateAction<boolean>>;
}) {
    const utils = api.useUtils();

    const { data: projects = [] } = api.project.getAllProjects.useQuery(
        undefined,
        {
            enabled: showMoveProjectCommand,
        }
    );

    const changeProjectMutation = api.thread.changeThreadProjectId.useMutation({
        onSuccess: async () => {
            await utils.thread.getInfiniteThreads.invalidate();
            await utils.project.getAllProjects.invalidate();
            setShowMoveProjectCommand(false);
        },
    });

    return (
        <CommandDialog
            open={showMoveProjectCommand}
            onOpenChange={setShowMoveProjectCommand}
        >
            <VisuallyHidden>
                <DialogTitle>Move to Project</DialogTitle>
            </VisuallyHidden>
            <CommandInput placeholder="Search projects..." />
            <CommandList>
                <CommandEmpty>No project found.</CommandEmpty>
                <CommandGroup>
                    {projects
                        .filter((project) => project.id !== thread.projectId)
                        .map((project) => (
                            <CommandItem
                                key={project.id}
                                onSelect={() => {
                                    changeProjectMutation.mutate({
                                        projectId: project.id,
                                        threadId: thread.id,
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

import { useRouter } from "next/navigation";
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
import { type DB_THREAD_TYPE } from "~/server/db/schema";
import { api } from "~/trpc/react";

export function ThreadDeleteDailog({
    thread,
    isActive,
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    thread: DB_THREAD_TYPE;
    isActive: boolean;
}) {
    const input = { limit: 20 };
    const router = useRouter();
    const utils = api.useUtils();
    const deleteThread = api.thread.deleteThreadById.useMutation({
        onMutate: async (threadId) => {
            await utils.thread.getInfiniteThreads.cancel(input);
            const prevData =
                utils.thread.getInfiniteThreads.getInfiniteData(input);

            utils.thread.getInfiniteThreads.setInfiniteData(
                input,
                (oldData) => {
                    if (!oldData) return oldData;
                    return {
                        ...oldData,
                        pages: oldData.pages.map((page) => ({
                            ...page,
                            items: page.items.filter(
                                (thread) => thread.id !== threadId
                            ),
                        })),
                    };
                }
            );

            return { prevData };
        },
        onError: (_error, _variables, context) => {
            if (context?.prevData) {
                utils.thread.getInfiniteThreads.setInfiniteData(
                    input,
                    context.prevData
                );
            }
        },
        onSettled: () => {
            utils.thread.getInfiniteThreads.invalidate(input);
        },
    });
    const handleDelete = async () => {
        await deleteThread.mutateAsync(thread.id);
        if (isActive) {
            router.push("/chat");
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete this thread and all its messages.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        type="button"
                        onClick={async () => {
                            await handleDelete();
                            onOpenChange(false);
                        }}
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

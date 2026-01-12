import { PinIcon, PinOffIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { type DB_THREAD_TYPE } from "~/server/db/schema";
import { api } from "~/trpc/react";

export function PinThreadButton({ thread }: { thread: DB_THREAD_TYPE }) {
    const input = { limit: 20 };
    const utils = api.useUtils();
    const toggleThreadPin = api.thread.toogleThreadPinById.useMutation({
        onMutate: async (threadId: string) => {
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
                            items: page.items.map((c) =>
                                c.id === threadId
                                    ? { ...c, isPinned: !c.isPinned }
                                    : c
                            ),
                        })),
                    };
                }
            );

            return { prevData };
        },
        onError: (_err, _threadId, context) => {
            if (context?.prevData) {
                utils.thread.getInfiniteThreads.setInfiniteData(
                    input,
                    context.prevData
                );
            }
        },
        onSettled: () => {
            void utils.thread.getInfiniteThreads.invalidate(input);
        },
    });
    return (
        <Button
            variant="ghost"
            className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-muted/90"
            tabIndex={-1}
            aria-label="Pin thread"
            onClick={() => toggleThreadPin.mutate(thread.id)}
        >
            {thread.isPinned ? (
                <PinOffIcon className="size-4" />
            ) : (
                <PinIcon className="size-4" />
            )}
        </Button>
    );
}

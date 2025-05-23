import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import { ThreadSideBar } from "../components/sidebar/thread-sidebar";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { api, HydrateClient } from "~/trpc/server";

export async function ThreadLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const session = await auth();
    if (!session) {
        redirect("/auth");
    }
    void api.thread.getInfiniteThreads({
        limit: 20,
    });
    return (
        <div className="relative flex h-[100dvh] text-gray-100">
            <SidebarProvider>
                <HydrateClient>
                    <ThreadSideBar user={session?.user} />
                </HydrateClient>
                <SidebarTrigger className="m-2 size-10 hover:bg-neutral-800/40 hover:text-white" />
                <main className="relative flex w-full flex-1 flex-col">
                    {children}
                </main>
            </SidebarProvider>
        </div>
    );
}

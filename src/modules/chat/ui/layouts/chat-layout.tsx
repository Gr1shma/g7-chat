import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import { ChatSideBar } from "../components/sidebar/chat-sidebar";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";

export async function ChatLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const session = await auth();
    if (!session) {
        redirect("/auth");
    }
    return (
        <div className="relative flex h-[100dvh] text-gray-100">
            <SidebarProvider>
                <ChatSideBar user={session?.user} />
                <SidebarTrigger className="m-2 size-10 hover:bg-neutral-800/40 hover:text-white" />
                <main className="relative flex w-full flex-1 flex-col">
                    {children}
                </main>
            </SidebarProvider>
        </div>
    );
}

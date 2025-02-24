import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import { ChatSideBar } from "../components/chat-sidebar";

export function ChatLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="relative flex h-[100dvh] text-gray-100">
            <SidebarProvider>
                <ChatSideBar />
                <SidebarTrigger className="m-2 size-10 hover:bg-neutral-800/40 hover:text-white" />
                <main className="relative flex w-full flex-1 flex-col">
                    {children}
                </main>
            </SidebarProvider>
        </div>
    );
}

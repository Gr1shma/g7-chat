export function ChatLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="relative flex h-[100dvh] text-gray-100">
            {/* Sidebar */}
            <main className="relative flex w-full flex-1 flex-col">
                {children}
            </main>
        </div>
    );
}

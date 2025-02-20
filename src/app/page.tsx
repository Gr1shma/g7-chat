import Link from "next/link";

export default function HomePage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-primary text-white">
            <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
                <Link
                    href="/chat"
                    className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
                >
                    Open Chat
                </Link>
            </div>
        </main>
    );
}

import { auth, signOut } from "~/server/auth";
import { redirect } from "next/navigation";
import { Button } from "~/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import AccountDetails from "../components/account/account-details";

export async function SettingLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const session = await auth();
    if (!session) {
        redirect("/auth");
    }
    return (
        <div className="max-h-screen w-full overflow-y-auto">
            <div className="absolute inset-0 -z-50">
                <div className="mx-auto flex max-w-[1200px] flex-col overflow-y-auto px-4 pb-24 pt-6 md:px-6 lg:px-8">
                    <SettingHeader />
                    <div className="flex flex-grow flex-col gap-4 md:flex-row">
                        <AccountDetails user={session.user} />
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

function SettingHeader() {
    return (
        <header className="flex items-center justify-between pb-8">
            <Button variant="ghost" asChild>
                <Link href="/chat">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Chat
                </Link>
            </Button>
            <div className="flex flex-row items-center gap-2">
                <form
                    action={async () => {
                        "use server";
                        await signOut({ redirectTo: "/" });
                    }}
                >
                    <Button variant="ghost" type="submit">
                        Sign out
                    </Button>
                </form>
            </div>
        </header>
    );
}

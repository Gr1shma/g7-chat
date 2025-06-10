import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import AccountDetails from "../components/account/account-details";
import SettingHeader from "./setting-header";

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

import { redirect } from "next/navigation";
import SettingViews from "~/modules/setting/ui/views/setting-views";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";

export default async function SettingPage() {
    const session = await auth();
    if (!session) {
        redirect("/auth");
    }
    void api.thread.getInfiniteThreads.prefetchInfinite({
        limit: 20,
    });
    void api.project.getAllProjects.prefetchInfinite();

    return (
        <HydrateClient>
            <SettingViews />
        </HydrateClient>
    );
}

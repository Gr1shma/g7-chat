import { redirect } from "next/navigation";
import SettingViews from "~/modules/setting/ui/views/setting-views";
import { auth } from "~/server/auth";

export default async function SettingPage() {
    const session = await auth();
    if (!session) {
        redirect("/auth");
    }
    return <SettingViews />;
}

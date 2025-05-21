import { redirect } from "next/navigation";
import AboutMeTab from "~/modules/setting/ui/components/tabs/about-me";
import AccountTab from "~/modules/setting/ui/components/tabs/account-tab";
import CustomizationTab from "~/modules/setting/ui/components/tabs/customization-tab";
import HistoryAndSyncTab from "~/modules/setting/ui/components/tabs/history-and-sync-tab";
import SettingViews, {
    type SettingTab,
} from "~/modules/setting/ui/views/setting-views";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";

export default async function SettingTabPage({
    params,
}: {
    params: Promise<{ tab: string }>;
}) {
    const session = await auth();
    if (!session) {
        redirect("/auth");
    }

    const user = await api.user.getUserById();

    const tabList: SettingTab[] = [
        {
            value: "account",
            name: "Account",
            component: <AccountTab user={user} />,
        },
        {
            value: "customization",
            name: "Customization",
            component: <CustomizationTab user={user} />,
        },
        {
            value: "history-and-sync",
            name: "History And Sync",
            component: <HistoryAndSyncTab />,
        },
        {
            value: "about-me",
            name: "About Me",
            component: <AboutMeTab />,
        },
    ];

    const { tab: tabParams } = await params;
    const isValidTab = tabList.some((tab) => tab.value === tabParams);

    if (!isValidTab) {
        redirect("/setting/account");
    }

    return <SettingViews tabList={tabList} user={user} />;
}

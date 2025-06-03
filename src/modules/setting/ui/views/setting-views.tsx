"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import AccountTab from "../components/tabs/account-tab";
import CustomizationTab from "../components/tabs/customization-tab";
import HistoryTab from "../components/tabs/history-tab";
import AboutMeTab from "../components/tabs/about-me";

export type SettingTab = {
    value: string;
    name: string;
    component: React.ReactNode;
};

const tabList: SettingTab[] = [
    {
        value: "account",
        name: "Account",
        component: <AccountTab />,
    },
    {
        value: "customization",
        name: "Customization",
        component: <CustomizationTab />,
    },
    {
        value: "history",
        name: "History",
        component: <HistoryTab />,
    },
    {
        value: "about-me",
        name: "About Me",
        component: <AboutMeTab />,
    },
];

export default function SettingViews() {
    return (
        <div className="md:w-3/4 md:pl-12">
            <Tabs defaultValue={tabList[0]?.value}>
                <div className="flex justify-center">
                    <TabsList className="no-scrollbar -mx-0.5 gap-1 overflow-auto rounded-lg text-secondary-foreground md:w-fit">
                        {tabList.map((tab) => (
                            <TabsTrigger key={tab.value} value={tab.value}>
                                {tab.name}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>
                {tabList.map((tab) => (
                    <TabsContent key={tab.value} value={tab.value}>
                        <div className="space-y-6">{tab.component}</div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}

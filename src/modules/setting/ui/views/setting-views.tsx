"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { DB_USER_TYPE } from "~/server/db/schema";

export type SettingTab = {
    value: string;
    name: string;
    component: React.ReactNode;
};

export default function SettingViews({ tabList, user }: { tabList: SettingTab[], user: DB_USER_TYPE  }) {
    const router = useRouter();
    const pathname = usePathname();
    const [activeTab, setActiveTab] = useState("account");
    const [_, startTransition] = useTransition();

    useEffect(() => {
        const tabValue = pathname.split("/").pop();

        if (tabValue && tabList.some((tab) => tab.value === tabValue)) {
            setActiveTab(tabValue);
        } else if (pathname === "/setting") {
            router.replace("/setting/account");
        }
    }, [pathname, router, tabList]);

    const handleTabChange = (value: string) => {
        setActiveTab(value);

        startTransition(() => {
            window.history.replaceState(null, "", `/setting/${value}`);
            router.replace(`/setting/${value}`, { scroll: false });
        });
    };

    return (
        <div className="md:w-3/4 md:pl-12">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
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

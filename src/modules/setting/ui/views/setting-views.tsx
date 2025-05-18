"use client"

import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"

export type SettingTab = {
    value: string
    name: string
    component: React.ReactNode
}

export default function SettingViews({ tabList }: { tabList: SettingTab[] }) {
    const router = useRouter()
    const pathname = usePathname()
    const [activeTab, setActiveTab] = useState("account")
    const [_, startTransition] = useTransition()

    useEffect(() => {
        const tabValue = pathname.split("/").pop()

        if (tabValue && tabList.some((tab) => tab.value === tabValue)) {
            setActiveTab(tabValue)
        } else if (pathname === "/setting") {
            router.replace("/setting/account")
        }
    }, [pathname, router, tabList])

    const handleTabChange = (value: string) => {
        setActiveTab(value);

        startTransition(() => {
            window.history.replaceState(null, "", `/setting/${value}`)
            router.replace(`/setting/${value}`, { scroll: false })
        });
    }

    return (
        <div className="md:w-3/4 md:pl-12">
            <div className="space-y-6">
                <Tabs value={activeTab} onValueChange={handleTabChange}>
                    <div className="flex justify-center">
                        <TabsList className="gap-1 rounded-lg text-secondary-foreground no-scrollbar -mx-0.5 overflow-auto md:w-fit">
                            {tabList.map((tab) => (
                                <TabsTrigger key={tab.value} value={tab.value}>
                                    {tab.name}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>
                    {tabList.map((tab) => (
                        <TabsContent key={tab.value} value={tab.value}>
                            {tab.component}
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </div>
    )
}

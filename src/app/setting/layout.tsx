import { SettingLayout } from "~/modules/setting/ui/layouts/setting-layout";

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    return <SettingLayout>{children}</SettingLayout>;
}

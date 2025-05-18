import { ThreadLayout } from "~/modules/thread/ui/layouts/thread-layout";

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    return <ThreadLayout>{children}</ThreadLayout>;
}

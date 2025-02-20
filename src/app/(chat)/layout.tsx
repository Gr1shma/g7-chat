import { ChatLayout } from "~/modules/chat/ui/layouts/chat-layout";

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    return <ChatLayout>{children}</ChatLayout>;
}

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import "~/styles/globals.css";

import { ThemeProvider } from "~/components/theme-provider";
import { TRPCReactProvider } from "~/trpc/react";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "~/components/ui/toaster";

export const metadata: Metadata = {
    title: "g7-chat",
    description: "shitty chatbot clone",
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html
            lang="en"
            className={`${GeistSans.variable}`}
            suppressHydrationWarning
        >
            <body className="">
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <SessionProvider>
                        <TRPCReactProvider>
                            {children}
                            <Toaster />
                        </TRPCReactProvider>
                    </SessionProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}

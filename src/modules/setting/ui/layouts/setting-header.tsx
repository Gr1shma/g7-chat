"use client";

import { useRef } from "react";
import { Button } from "~/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAPIKeyStore } from "~/lib/ai/store";
import { serverSignOut } from "./sign-out";

export default function SettingHeader() {
    const formRef = useRef<HTMLFormElement>(null);

    const handleSignOut = () => {
        useAPIKeyStore.persist.clearStorage();
        useAPIKeyStore.setState({
            keys: {
                google: "",
                openrouter: "",
                openai: "",
                groq: "",
            },
        });

        formRef.current?.requestSubmit();
    };

    return (
        <header className="flex items-center justify-between pb-8">
            <Button variant="ghost" asChild>
                <Link href="/chat">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Chat
                </Link>
            </Button>
            <div className="flex flex-row items-center gap-2">
                <form ref={formRef} action={serverSignOut}>
                    <Button
                        variant="ghost"
                        type="button"
                        onClick={handleSignOut}
                    >
                        Sign out
                    </Button>
                </form>
            </div>
        </header>
    );
}

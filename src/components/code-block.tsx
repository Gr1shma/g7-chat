"use client";

import { createContext, useContext } from "react";
import ShikiHighlighter from "react-shiki";
import { Copy } from "lucide-react";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { useToast } from "~/hooks/use-toast";

interface CodeComponentProps {
    children: any;
    className?: string;
}

interface CodebarProps {
    lang: string | undefined;
    codeString: string;
}

type MarkdownSize = "default" | "small";

const MarkdownSizeContext = createContext<MarkdownSize>("default");

function Codebar({ lang = "plain", codeString }: CodebarProps) {
    const { toast } = useToast();

    const onCopy = () => {
        navigator.clipboard.writeText(codeString);
        toast({
            description: "Code copied to clipboard",
            duration: 2000,
        });
    };

    return (
        <div className="flex h-9 items-center justify-between rounded-md border-b px-3">
            <span className="text-xs text-muted-foreground">{lang}</span>
            <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-muted-foreground/10"
                onClick={onCopy}
            >
                <Copy className="size-3.5" />
                <span className="sr-only">Copy code</span>
            </Button>
        </div>
    );
}

export function CodeBlock({
    children,
    className,
    ...props
}: CodeComponentProps) {
    const size = useContext(MarkdownSizeContext);
    const match = /language-(\w+)/.exec(className || "");

    if (match) {
        const lang = match[1];
        return (
            <div className="my-6 rounded-lg border bg-muted shadow-sm">
                <Codebar lang={lang} codeString={String(children)} />
                <ShikiHighlighter
                    language={lang}
                    theme={"material-theme-darker"}
                    className={cn(
                        "font-mono text-sm",
                        "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/30",
                        "[&>pre]:my-0 [&>pre]:max-h-[650px] [&>pre]:p-4"
                    )}
                    showLanguage={false}
                >
                    {String(children)}
                </ShikiHighlighter>
            </div>
        );
    }

    const inlineCodeClasses = cn(
        "overflow-auto font-mono bg-muted text-foreground rounded-md",
        size === "small"
            ? "mx-0.5 px-1 py-0.5 text-xs"
            : "mx-0.5 px-2 py-1 text-sm"
    );

    return (
        <code className={inlineCodeClasses} {...props}>
            {children}
        </code>
    );
}

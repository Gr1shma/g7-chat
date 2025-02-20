"use client";

import { Copy as CopyIcon } from "lucide-react";
import Prism from "prismjs";
import LoadLanguages from "prismjs/components/";
LoadLanguages([
    "bash",
    "css",
    "html",
    "python",
    "java",
    "csharp",
    "php",
    "r",
    "ruby",
    "perl",
    "zig",
    "dart",
    "elixir",
]);
import { Highlight, themes } from "prism-react-renderer";

interface CodeBlockProps {
    node: any;
    inline: boolean;
    className: string;
    children: any;
}

export function CodeBlock({
    node,
    inline,
    className,
    children,
    ...props
}: CodeBlockProps) {
    const match = /language-(\w+)/.exec(className || "");
    const language = match ? match[1] : "";
    const code = String(children).replace(/\n$/, "");

    if (inline) {
        return (
            <code
                className={`${className} rounded-md bg-zinc-100 px-1 py-0.5 text-sm dark:bg-zinc-800`}
                {...props}
            >
                {children}
            </code>
        );
    }

    if (language === "") {
        return <code className="font-bold">{code}</code>;
    }

    return (
        <div className="overflow-hidden rounded-lg">
            {language && (
                <div className="flex items-center justify-between border-b border-zinc-800 bg-[#1e1e1e] px-4 py-2 text-zinc-400">
                    <span className="text-sm">{language}</span>
                    <button
                        className="rounded p-1 transition-colors hover:bg-zinc-700"
                        onClick={() => {
                            navigator.clipboard.writeText(code);
                        }}
                    >
                        <CopyIcon className="size-4" />
                    </button>
                </div>
            )}
            <Highlight
                prism={Prism}
                theme={themes.vsDark}
                code={code}
                language={language || "text"}
            >
                {({
                    className,
                    style,
                    tokens,
                    getLineProps,
                    getTokenProps,
                }) => (
                    <pre
                        className={`${className} w-full overflow-x-auto bg-[#1e1e1e] p-4 text-sm`}
                        style={style}
                    >
                        <code>
                            {tokens.map((line, i) => (
                                <div key={i} {...getLineProps({ line })}>
                                    {line.map((token, key) => (
                                        <span
                                            key={key}
                                            {...getTokenProps({ token })}
                                        />
                                    ))}
                                </div>
                            ))}
                        </code>
                    </pre>
                )}
            </Highlight>
        </div>
    );
}

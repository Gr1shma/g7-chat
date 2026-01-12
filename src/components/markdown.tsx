"use client";
import Link from "next/link";
import React, { type ReactNode, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import { CodeBlock } from "./code-block";
import { visit } from "unist-util-visit";
import { cn } from "~/lib/utils";
import { ChevronRight } from "lucide-react";
import {
    Table,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table";

const Think = ({ children }: { children: ReactNode }) => {
    const [open, setOpen] = useState(false);
    return (
        <details
            className="group my-2 text-muted-foreground"
            open={open}
            onToggle={(e) => setOpen(e.currentTarget.open)}
        >
            <summary
                className={cn(
                    "flex cursor-pointer select-none items-center gap-1.5",
                    "text-sm font-medium transition-colors duration-200 hover:text-foreground"
                )}
            >
                <ChevronRight
                    className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        "text-muted-foreground/50 group-hover:text-muted-foreground",
                        open && "rotate-90"
                    )}
                />
                <span>Thought Process</span>
            </summary>
            <div
                className={cn(
                    "mt-2 space-y-2 pl-5 text-sm",
                    "text-muted-foreground/90",
                    "prose-sm prose-neutral dark:prose-invert",
                    "whitespace-pre-wrap"
                )}
            >
                {children}
            </div>
        </details>
    );
};

interface DirectiveNode {
    type: string;
    name?: string;
    data?: {
        hName?: string;
        hProperties?: Record<string, unknown>;
    };
    attributes?: Record<string, unknown>;
}

const remarkThinkBlock = () => {
    return (tree: { type: string }) => {
        visit(tree, (node: DirectiveNode) => {
            if (
                node.type === "textDirective" ||
                node.type === "leafDirective" ||
                node.type === "containerDirective"
            ) {
                if (node.name !== "think") return;

                const data = node.data ?? (node.data = {});
                data.hName = "think";
                data.hProperties = node.attributes ?? {};
            }
        });
    };
};

const components: Partial<Components> = {
    // @ts-expect-error - CodeBlock has custom props that differ from react-markdown's code component
    code: CodeBlock,
    pre: ({ children }) => <>{children}</>,
    ol: ({ children, ...props }) => {
        return (
            <ol className="ml-4 list-outside list-decimal" {...props}>
                {children}
            </ol>
        );
    },
    li: ({ children, ...props }) => {
        return (
            <li className="py-1" {...props}>
                {children}
            </li>
        );
    },
    ul: ({ children, ...props }) => {
        return (
            <ul className="ml-4 list-outside list-decimal" {...props}>
                {children}
            </ul>
        );
    },
    strong: ({ children, ...props }) => {
        return (
            <span className="font-semibold" {...props}>
                {children}
            </span>
        );
    },
    a: ({ children, ...props }) => {
        return (
            // @ts-expect-error - Link component accepts href from props spread
            <Link
                className="text-blue-500 hover:underline"
                target="_blank"
                rel="noreferrer"
                {...props}
            >
                {children}
            </Link>
        );
    },
    h1: ({ children, ...props }) => {
        return (
            <h1 className="mb-2 mt-6 text-3xl font-semibold" {...props}>
                {children}
            </h1>
        );
    },
    h2: ({ children, ...props }) => {
        return (
            <h2 className="mb-2 mt-6 text-2xl font-semibold" {...props}>
                {children}
            </h2>
        );
    },
    h3: ({ children, ...props }) => {
        return (
            <h3 className="mb-2 mt-6 text-xl font-semibold" {...props}>
                {children}
            </h3>
        );
    },
    h4: ({ children, ...props }) => {
        return (
            <h4 className="mb-2 mt-6 text-lg font-semibold" {...props}>
                {children}
            </h4>
        );
    },
    h5: ({ children, ...props }) => {
        return (
            <h5 className="mb-2 mt-6 text-base font-semibold" {...props}>
                {children}
            </h5>
        );
    },
    h6: ({ children, ...props }) => {
        return (
            <h6 className="mb-2 mt-6 text-sm font-semibold" {...props}>
                {children}
            </h6>
        );
    },
    think: Think,
    table: ({ children, ...props }) => (
        <div className="my-4 w-full">
            <Table
                className="border-collapse [&_tr:last-child]:border-0"
                {...props}
            >
                {children}
            </Table>
        </div>
    ),
    thead: ({ children, ...props }) => (
        <TableHeader {...props}>{children}</TableHeader>
    ),
    tr: ({ children, ...props }) => (
        <TableRow className="hover:bg-muted/50" {...props}>
            {children}
        </TableRow>
    ),
    th: ({ children, ...props }) => (
        <TableHead
            className="h-9 px-4 text-xs font-medium text-muted-foreground"
            {...props}
        >
            {children}
        </TableHead>
    ),
    td: ({ children, ...props }) => (
        <TableCell className="px-4 py-2.5" {...props}>
            {children}
        </TableCell>
    ),
};

type MarkdownProps = { children: string };

const NonMemoizedMarkdown = ({ children }: MarkdownProps) => {
    const processContent = (content: string) => {
        return content
            .replace(/\\n/g, "\n")
            .replace(
                /<think>\n?([\s\S]*?)\n?<\/think>/g,
                (_match, thinkContent: string) => {
                    return `:::think\n${thinkContent.trim()}\n:::`;
                }
            );
    };

    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkDirective, remarkThinkBlock]}
            components={components}
        >
            {processContent(children)}
        </ReactMarkdown>
    );
};

export const Markdown = React.memo(
    NonMemoizedMarkdown,
    (prev, next) => prev.children === next.children
);

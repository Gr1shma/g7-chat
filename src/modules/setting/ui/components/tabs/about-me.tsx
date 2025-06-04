"use client";

import Link from "next/link";
import {
    Link as LinkIcon,
    Github,
    Twitter,
    Linkedin,
    Sparkles,
    Mail,
} from "lucide-react";

export default function AboutMeTab() {
    return (
        <div className="mx-auto max-w-3xl space-y-6 p-6 text-base text-zinc-800 dark:text-zinc-200">
            <section>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                    About Me
                </h1>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                    Hey, I’m{" "}
                    <Link
                        href="https://grishmadhakal.com.np/"
                        target="_blank"
                        className="inline-flex items-center gap-1 font-semibold text-pink-600 hover:underline"
                    >
                        Gr1shma
                    </Link>{" "}
                    — a developer who loves clean tools, fast UIs, and full
                    control.
                </p>
            </section>

            <section>
                <h2 className="flex flex-row items-center gap-1 text-xl font-semibold">
                    <LinkIcon className="h-4 w-4 text-pink-600" />
                    Links
                </h2>
                <ul className="mt-2 space-y-2">
                    <li>
                        <Link
                            href="https://github.com/Gr1shma/g7-chat"
                            target="_blank"
                            className="inline-flex items-center gap-2 text-blue-600 hover:underline dark:text-blue-400"
                        >
                            <Github className="h-4 w-4 text-pink-600" />
                            GitHub Repository
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="https://x.com/grishma_dhakal"
                            target="_blank"
                            className="inline-flex items-center gap-2 text-blue-600 hover:underline dark:text-blue-400"
                        >
                            <Twitter className="h-4 w-4 text-pink-600" />X
                            (Twitter)
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="https://www.linkedin.com/in/grishma-dhakal/"
                            target="_blank"
                            className="inline-flex items-center gap-2 text-blue-600 hover:underline dark:text-blue-400"
                        >
                            <Linkedin className="h-4 w-4 text-pink-600" />
                            LinkedIn
                        </Link>
                    </li>
                </ul>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                    Why I Built This
                </h2>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                    I built{" "}
                    <span className="font-semibold text-zinc-900 dark:text-white">
                        g7-chat
                    </span>{" "}
                    to create a fast, minimalist AI chat interface for power
                    users like myself. Most chat UIs are either bloated or
                    restrictive — I wanted full control over my conversations,
                    complete visibility of my threads, and a clean experience
                    that stays out of the way.
                </p>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                    It’s open-source, privacy-first, and tuned for speed with
                    Next.js, tRPC, Tailwind, and the Vercel AI SDK.
                </p>
            </section>

            <section>
                <h2 className="flex items-center gap-2 text-xl font-semibold text-zinc-900 dark:text-white">
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                    Acknowledgements
                </h2>
                <ul className="mt-2 list-inside list-disc space-y-2">
                    <li>
                        <Link
                            href="https://t3.chat/"
                            target="_blank"
                            className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                            t3.chat – The core inspiration behind g7-chat.
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="https://create.t3.gg/"
                            target="_blank"
                            className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                            T3 Stack – A robust Next.js starter kit.
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="https://ui.shadcn.com/"
                            target="_blank"
                            className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                            shadcn/ui – Headless, accessible UI components.
                        </Link>
                    </li>
                </ul>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                    Suggestions or Feedback?
                </h2>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                    I'd love to hear from you! Feel free to{" "}
                    <a
                        href="mailto:contact@grishmadhakal.com.np"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
                    >
                        email me <Mail className="h-4 w-4 text-pink-600" />
                    </a>{" "}
                    with suggestions or questions.
                </p>
            </section>
        </div>
    );
}

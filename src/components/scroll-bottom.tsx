"use client"

import { ChevronDown } from "lucide-react"
import { useState, useEffect } from "react"

export default function ScrollComponent() {
    const [showScroll, setShowScroll] = useState(true)

    const scrollToBottom = () => {
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: "smooth",
        })
    }

    // Hide scroll button when at bottom
    useEffect(() => {
        const handleScroll = () => {
            const isBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight
            setShowScroll(!isBottom)
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6">
            <div className="space-y-4">
                <code className="text-sky-400">export default MyComponent;</code>

                <div className="relative">
                    <h2 className="text-xl font-semibold">Important Notes:</h2>

                    {showScroll && (
                        <button
                            onClick={scrollToBottom}
                            className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800/80 backdrop-blur-sm hover:bg-zinc-700/80 transition-colors"
                        >
                            Scroll to bottom
                            <ChevronDown className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

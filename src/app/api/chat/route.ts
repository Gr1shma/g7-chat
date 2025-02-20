import { NextResponse } from "next/server";

import { streamText, UIMessage } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(req: Request) {
    try {
        const { messages }: { messages: UIMessage[] } = await req.json();
        const text = streamText({
            model: google("gemini-1.5-pro-latest"),
            messages,
        });
        return text.toDataStreamResponse();
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to generate AI response" },
            { status: 500 }
        );
    }
}

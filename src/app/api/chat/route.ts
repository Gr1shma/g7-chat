import { streamText, type UIMessage } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(req: Request) {
    const { messages }: { messages: UIMessage[] } = await req.json();
    const text = streamText({
        model: google("gemini-1.5-pro-latest"),
        messages,
    });
    return text.toDataStreamResponse();
}

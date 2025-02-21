import { streamText, type UIMessage } from "ai";
import { google } from "@ai-sdk/google";
import { auth } from "~/server/auth";

export async function POST(req: Request) {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
        return new Response("Unauthorized", { status: 401 });
    }

    const { messages }: { messages: UIMessage[] } = await req.json();
    const text = streamText({
        model: google("gemini-1.5-pro-latest"),
        messages,
    });
    return text.toDataStreamResponse();
}

import { auth } from "~/server/auth";
import { NextRequest } from "next/server";
import { QUERIES } from "~/server/db/queries";

export async function GET(request: NextRequest) {
    const cursor = request.nextUrl.searchParams.get("cursor");

    const session = await auth();

    if (!session?.user?.id) {
        return Response.json("Unauthorized!", { status: 401 });
    }

    try {
        const chats = await QUERIES.chatQueries.getChatsByUserId({
            cursor,
            limit: 10,
        });
        return Response.json(chats);
    } catch (_) {
        return Response.json("Failed to fetch chats!", { status: 500 });
    }
}

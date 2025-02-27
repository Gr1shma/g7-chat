import { auth } from "~/server/auth";
import { QUERIES } from "~/server/db/queries";

export async function GET() {
    const session = await auth();

    if (!session || !session.user) {
        return Response.json("Unauthorized!", { status: 401 });
    }
    const chats = await QUERIES.chatQueries.getChatsByUserId({
        id: session.user.id!,
    });
    return Response.json(chats);
}

import "server-only";

import { eq } from "drizzle-orm";
import { db } from ".";

import { chats_table, messages_table } from "./schema";

export async function deleteChatById({ id }: { id: string }) {
    try {
        await db.delete(messages_table).where(eq(messages_table.chatId, id));
        return await db.delete(chats_table).where(eq(chats_table.id, id));
    } catch (error) {
        console.error("Failed to delete chat by id from database");
        throw error;
    }
}

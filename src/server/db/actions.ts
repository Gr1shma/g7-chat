import "server-only";

import { eq } from "drizzle-orm";
import { db } from ".";

import { threads_table, messages_table } from "./schema";

export async function deleteThreadById({ id }: { id: string }) {
    try {
        await db.delete(messages_table).where(eq(messages_table.threadId, id));
        return await db.delete(threads_table).where(eq(threads_table.id, id));
    } catch (error) {
        throw error;
    }
}

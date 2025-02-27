import "server-only";
import "server-only";

import { asc, desc, eq } from "drizzle-orm";
import { db } from ".";

import { threads_table, messages_table } from "./schema";

export const QUERIES = {
    thread: {
        getById: async function getChatById({ id }: { id: string }) {
            try {
                const [selectedChat] = await db
                    .select()
                    .from(threads_table)
                    .where(eq(threads_table.id, id));
                return selectedChat;
            } catch (error) {
                throw error;
            }
        },
        getByUserId: async function getChatsByUserId({
            id,
        }: {
            id: string;
        }) {
            try {
                return await db
                    .select()
                    .from(threads_table)
                    .where(eq(threads_table.userId, id))
                    .orderBy(desc(threads_table.createdAt));
            } catch (error) {
                throw error;
            }
        },
    },
    message: {
        getByThreadId: async function getMessagesByChatId({
            threadId,
        }: {
            threadId: string;
        }) {
            try {
                return await db
                    .select()
                    .from(messages_table)
                    .where(eq(messages_table.threadId, threadId))
                    .orderBy(asc(messages_table.createdAt));
            } catch (error) {
                throw error;
            }
        },
        getById: async function getMessageById({ id }: { id: string }) {
            try {
                return await db
                    .select()
                    .from(messages_table)
                    .where(eq(messages_table.id, id));
            } catch (error) {
                throw error;
            }
        },
    },
};

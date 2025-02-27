import "server-only";
import "server-only";

import { asc, desc, eq } from "drizzle-orm";
import { db } from ".";

import { chats_table, messages_table } from "./schema";

export const QUERIES = {
    chatQueries: {
        getChatById: async function getChatById({ id }: { id: string }) {
            try {
                const [selectedChat] = await db
                    .select()
                    .from(chats_table)
                    .where(eq(chats_table.id, id));
                return selectedChat;
            } catch (error) {
                throw error;
            }
        },
        getChatsByUserId: async function getChatsByUserId({
            id,
        }: {
            id: string;
        }) {
            try {
                return await db
                    .select()
                    .from(chats_table)
                    .where(eq(chats_table.userId, id))
                    .orderBy(desc(chats_table.createdAt));
            } catch (error) {
                throw error;
            }
        },
    },
    messageQueries: {
        getMessagesByChatId: async function getMessagesByChatId({
            chatId,
        }: {
            chatId: string;
        }) {
            try {
                return await db
                    .select()
                    .from(messages_table)
                    .where(eq(messages_table.chatId, chatId))
                    .orderBy(asc(messages_table.createdAt));
            } catch (error) {
                throw error;
            }
        },
        getMessageById: async function getMessageById({ id }: { id: string }) {
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

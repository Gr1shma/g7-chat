import "server-only";

import { db } from ".";

import { chats_table, messages_table, type DB_MESSAGE_TYPE } from "./schema";
import { and, eq } from "drizzle-orm";

export const MUTATIONS = {
    chatMutations: {
        saveChat: async function saveChat({
            id,
            userId,
            title,
        }: {
            id: string;
            userId: string;
            title: string;
        }) {
            try {
                return await db.insert(chats_table).values({
                    id,
                    createdAt: new Date(),
                    userId,
                    title,
                });
            } catch (error) {
                throw error;
            }
        },
        changeTitle: async function changeTitle({
            id,
            title,
        }: {
            id: string;
            title: string;
        }) {
            try {
                await db.update(chats_table).set({ title }).where(
                    and(
                        eq(chats_table.id, id),
                    )
                )
            } catch (error) {
                throw error;
            }
        },
    },
    messageMutations: {
        saveMessages: async function saveMessages({
            messages,
        }: {
            messages: Array<DB_MESSAGE_TYPE>;
        }) {
            try {
                return await db.insert(messages_table).values(messages);
            } catch (error) {
                throw error;
            }
        },
    },
};

import "server-only";

import { db } from ".";

import { threads_table, messages_table, type DB_MESSAGE_TYPE } from "./schema";

export const MUTATIONS = {
    thread: {
        save: async function saveChat({
            id,
            userId,
            title,
        }: {
            id: string;
            userId: string;
            title: string;
        }) {
            try {
                return await db.insert(threads_table).values({
                    id,
                    createdAt: new Date(),
                    userId,
                    title,
                });
            } catch (error) {
                throw error;
            }
        },
    },
    message: {
        save: async function saveMessages({
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

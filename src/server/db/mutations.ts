import "server-only";

import { db } from ".";

import { chats_table, messages_table, type DB_MESSAGE_TYPE } from "./schema";

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
                console.error("Failed to save chat in database");
                throw error;
            }
        },
    },
    messageMutations: {
        sageMessage: async function saveMessages({
            messages,
        }: {
            messages: Array<DB_MESSAGE_TYPE>;
        }) {
            try {
                return await db.insert(messages_table).values(messages);
            } catch (error) {
                console.error("Failed to save messages in database", error);
                throw error;
            }
        },
    },
};

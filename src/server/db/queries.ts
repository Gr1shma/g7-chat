import "server-only";
import "server-only";

import { and, asc, desc, eq, gt, lt, SQL } from "drizzle-orm";
import { db } from ".";

import { chats_table, DB_CHAT_TYPE, messages_table } from "./schema";

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
            limit,
            startingAfter,
            endingBefore,
        }: {
            id: string;
            limit: number;
            startingAfter: string | null;
            endingBefore: string | null;
        }) {
            try {
                const extendedLimit = limit + 1;

                const query = (whereCondition?: SQL<any>) =>
                    db
                        .select()
                        .from(chats_table)
                        .where(
                            whereCondition
                                ? and(
                                      whereCondition,
                                      eq(chats_table.userId, id)
                                  )
                                : eq(chats_table.userId, id)
                        )
                        .orderBy(desc(chats_table.createdAt))
                        .limit(extendedLimit);

                let filteredChats: Array<DB_CHAT_TYPE> = [];

                if (startingAfter) {
                    const [selectedChat] = await db
                        .select()
                        .from(chats_table)
                        .where(eq(chats_table.id, startingAfter))
                        .limit(1);

                    if (!selectedChat) {
                        throw new Error(
                            `Chat with id ${startingAfter} not found`
                        );
                    }

                    filteredChats = await query(
                        gt(chats_table.createdAt, selectedChat.createdAt)
                    );
                } else if (endingBefore) {
                    const [selectedChat] = await db
                        .select()
                        .from(chats_table)
                        .where(eq(chats_table.id, endingBefore))
                        .limit(1);

                    if (!selectedChat) {
                        throw new Error(
                            `Chat with id ${endingBefore} not found`
                        );
                    }

                    filteredChats = await query(
                        lt(chats_table.createdAt, selectedChat.createdAt)
                    );
                } else {
                    filteredChats = await query();
                }

                const hasMore = filteredChats.length > limit;

                return {
                    chats: hasMore
                        ? filteredChats.slice(0, limit)
                        : filteredChats,
                    hasMore,
                };
            } catch (error) {
                console.error("Failed to get chats by user from database");
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

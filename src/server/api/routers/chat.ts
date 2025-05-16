import { TRPCError } from "@trpc/server";
import { and, desc, eq, lt, or } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { chats_table, messages_table } from "~/server/db/schema";

export const chatRouter = createTRPCRouter({
    getChatById: protectedProcedure
        .input(z.string())
        .query(async ({ ctx, input }) => {
            const { db, session } = ctx;
            const userId = session.user?.id;

            if (!userId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Not authenticated",
                });
            }

            try {
                const [chat] = await db
                    .select()
                    .from(chats_table)
                    .where(
                        and(
                            eq(chats_table.id, input),
                            eq(chats_table.userId, userId)
                        )
                    );
                return chat;
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to get chat",
                });
            }
        }),

    getInfiniteChats: protectedProcedure
        .input(
            z.object({
                cursor: z
                    .object({
                        id: z.string(),
                        updatedAt: z.date(),
                    })
                    .nullish(),
                limit: z.number().min(1).max(50),
            })
        )
        .query(async ({ ctx, input }) => {
            const { db, session } = ctx;
            const userId = session.user?.id;

            if (!userId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Not authenticated",
                });
            }

            try {
                const { cursor, limit } = input;

                const whereClause = cursor
                    ? and(
                          eq(chats_table.userId, userId),
                          or(
                              lt(chats_table.updatedAt, cursor.updatedAt),
                              and(
                                  eq(chats_table.updatedAt, cursor.updatedAt),
                                  lt(chats_table.id, cursor.id)
                              )
                          )
                      )
                    : eq(chats_table.userId, userId);

                const data = await db
                    .select()
                    .from(chats_table)
                    .where(whereClause)
                    .orderBy(desc(chats_table.updatedAt), desc(chats_table.id))
                    .limit(limit + 1);

                const hasMore = data.length > limit;
                const items = hasMore ? data.slice(0, -1) : data;
                const lastItem = items[items.length - 1];

                return {
                    items,
                    nextCursor:
                        hasMore && lastItem
                            ? { id: lastItem.id, updatedAt: lastItem.updatedAt }
                            : null,
                };
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to fetch chats",
                });
            }
        }),

    save: protectedProcedure
        .input(
            z.object({
                chatId: z.string(),
                title: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { db, session } = ctx;
            const userId = session.user?.id;

            if (!userId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Not authenticated",
                });
            }

            try {
                await db.insert(chats_table).values({
                    id: input.chatId,
                    createdAt: new Date(),
                    userId,
                    title: input.title,
                });
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to save chat",
                });
            }
        }),

    changeTitle: protectedProcedure
        .input(
            z.object({
                chatId: z.string(),
                title: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { db, session } = ctx;
            const userId = session.user?.id;

            if (!userId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Not authenticated",
                });
            }

            try {
                const result = await db
                    .update(chats_table)
                    .set({ title: input.title })
                    .where(
                        and(
                            eq(chats_table.id, input.chatId),
                            eq(chats_table.userId, userId)
                        )
                    );

                if (result.rowCount === 0) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Chat not found or unauthorized",
                    });
                }
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to change chat title",
                });
            }
        }),

    deleteById: protectedProcedure
        .input(z.string())
        .mutation(async ({ ctx, input }) => {
            const { db, session } = ctx;
            const userId = session.user?.id;

            if (!userId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Not authenticated",
                });
            }

            try {
                await db
                    .delete(messages_table)
                    .where(eq(messages_table.chatId, input));

                const result = await db
                    .delete(chats_table)
                    .where(
                        and(
                            eq(chats_table.id, input),
                            eq(chats_table.userId, userId)
                        )
                    );

                if (result.rowCount === 0) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Chat not found or unauthorized",
                    });
                }
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to delete chat",
                });
            }
        }),
});

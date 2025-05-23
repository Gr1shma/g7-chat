import { TRPCError } from "@trpc/server";
import { and, desc, eq, lt, not, or } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { threads_table, messages_table } from "~/server/db/schema";

export const threadRouter = createTRPCRouter({
    getThreadById: protectedProcedure
        .input(z.string())
        .query(async ({ ctx, input }) => {
            const { db, session } = ctx;
            const userId = session.user.id;

            try {
                const [thread] = await db
                    .select()
                    .from(threads_table)
                    .where(
                        and(
                            eq(threads_table.id, input),
                            eq(threads_table.userId, userId)
                        )
                    );
                return thread;
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to get thread",
                });
            }
        }),
    getInfiniteThreads: protectedProcedure
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
            const userId = session.user.id;

            try {
                const { cursor, limit } = input;

                const whereClause = cursor
                    ? and(
                          eq(threads_table.userId, userId),
                          or(
                              lt(threads_table.updatedAt, cursor.updatedAt),
                              and(
                                  eq(threads_table.updatedAt, cursor.updatedAt),
                                  lt(threads_table.id, cursor.id)
                              )
                          )
                      )
                    : eq(threads_table.userId, userId);

                const data = await db
                    .select()
                    .from(threads_table)
                    .where(whereClause)
                    .orderBy(
                        desc(threads_table.updatedAt),
                        desc(threads_table.id)
                    )
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
                    message: "Failed to fetch threads",
                });
            }
        }),

    saveThread: protectedProcedure
        .input(
            z.object({
                threadId: z.string(),
                title: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { db, session } = ctx;
            const userId = session.user?.id;

            try {
                await db.insert(threads_table).values({
                    id: input.threadId,
                    createdAt: new Date(),
                    userId,
                    title: input.title,
                });
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to save thread",
                });
            }
        }),

    changeThreadTitle: protectedProcedure
        .input(
            z.object({
                threadId: z.string(),
                title: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { db, session } = ctx;
            const userId = session.user?.id;

            try {
                const result = await db
                    .update(threads_table)
                    .set({ title: input.title })
                    .where(
                        and(
                            eq(threads_table.id, input.threadId),
                            eq(threads_table.userId, userId)
                        )
                    );

                if (result.rowCount === 0) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Thread not found or unauthorized",
                    });
                }
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to change thread title",
                });
            }
        }),
    toogleThreadPinById: protectedProcedure
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
                const result = await db
                    .update(threads_table)
                    .set({
                        isPinned: not(threads_table.isPinned),
                    })
                    .where(
                        and(
                            eq(threads_table.id, input),
                            eq(threads_table.userId, userId)
                        )
                    );

                if (result.rowCount === 0) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Thread not found or unauthorized",
                    });
                }
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to toggle pin of thread",
                });
            }
        }),
    deleteThreadById: protectedProcedure
        .input(z.string())
        .mutation(async ({ ctx, input }) => {
            const { db, session } = ctx;
            const userId = session.user?.id;

            try {
                await db
                    .delete(messages_table)
                    .where(eq(messages_table.threadId, input));

                await db
                    .delete(threads_table)
                    .where(
                        and(
                            eq(threads_table.id, input),
                            eq(threads_table.userId, userId)
                        )
                    );
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to delete thread",
                });
            }
        }),
});

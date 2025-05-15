import { and, desc, eq, lt, or } from "drizzle-orm";
import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { chats_table } from "~/server/db/schema";

export const chatRouter = createTRPCRouter({
    getInfiniteChats: protectedProcedure
        .input(
            z.object({
                cursor: z.object({
                    id: z.string(),
                    updatedAt: z.date(),
                }).nullish(),
                limit: z.number().min(1).max(50),
            })
        )
        .query(async ({ ctx, input }) => {
            const { cursor, limit } = input;
            const { db, session } = ctx;
            const userId = session.user.id;

            const data = await db.select().from(chats_table).where(and(
                eq(chats_table.userId, userId),
                cursor ? or(
                    lt(chats_table.updatedAt, cursor.updatedAt),
                    and(
                        eq(chats_table.updatedAt, cursor.updatedAt),
                        lt(chats_table.id, cursor.id),
                    )
                ) : undefined,
            )).orderBy(desc(chats_table.updatedAt), desc(chats_table.id)).limit(limit + 1);


            const hasMore = data.length > limit;
            const items = hasMore ? data.slice(0, -1) : data;
            const lastItem = items[items.length - 1];
            const nextCursor = hasMore && lastItem
                ? {
                    id: lastItem.id,
                    updatedAt: lastItem.updatedAt,
                }
                : null;
            return {
                items,
                nextCursor,
            };
        }),
    changeTitle: protectedProcedure
        .input(
            z.object({
                chatId: z.string(),
                title: z.string(),
            })
        ).mutation(async ({ ctx, input }) => {
            const { chatId, title } = input;
            const { db, session } = ctx;
            const userId = session.user.id;
            await db.update(chats_table).set({
                title,
            }).where(and(
                eq(chats_table.id, chatId),
                eq(chats_table.userId, userId),
            ))
        }),
});

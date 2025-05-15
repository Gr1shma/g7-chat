import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { messages_table } from "~/server/db/schema";

export const messageRouter = createTRPCRouter({
    getMessagesByChatId: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
        const chatId = input;
        const { db } = ctx;
        try {
            return await db
                .select()
                .from(messages_table)
                .where(eq(messages_table.chatId, chatId))
                .orderBy(asc(messages_table.createdAt));
        } catch (error) {
            throw error;
        }

    }),
    getMessageById: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
        const id = input;
        const { db } = ctx;
        try {
            return await db
                .select()
                .from(messages_table)
                .where(eq(messages_table.id, id));
        } catch (error) {
            throw error;
        }
    }),
});

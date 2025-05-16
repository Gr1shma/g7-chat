import { TRPCError } from "@trpc/server";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { messages_table } from "~/server/db/schema";

export const messageRouter = createTRPCRouter({
    getMessagesByChatId: protectedProcedure
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
                const messages = await db
                    .select()
                    .from(messages_table)
                    .where(eq(messages_table.chatId, input))
                    .orderBy(asc(messages_table.createdAt));

                return messages;
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to fetch messages for this chat",
                });
            }
        }),

    getMessageById: protectedProcedure
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
                const [message] = await db
                    .select()
                    .from(messages_table)
                    .where(eq(messages_table.id, input));

                if (!message) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Message not found",
                    });
                }

                return message;
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to fetch message",
                });
            }
        }),
});

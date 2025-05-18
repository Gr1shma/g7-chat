import {
    accounts,
    sessions,
    users,
    verificationTokens,
    threads_table,
    messages_table,
} from "~/server/db/schema";
import { eq, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";

export const userRouter = createTRPCRouter({
    deleteUserByuserId: protectedProcedure
        .input(z.object({ userId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { db, session } = ctx;

            if (session.user.id !== input.userId) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You can only delete your own account.",
                });
            }
            try {
                const userThreads = await db
                    .select({ id: threads_table.id })
                    .from(threads_table)
                    .where(eq(threads_table.userId, input.userId));

                const threadIds = userThreads.map((t) => t.id);

                if (threadIds.length > 0) {
                    await db
                        .delete(messages_table)
                        .where(inArray(messages_table.threadId, threadIds));
                }

                await db
                    .delete(threads_table)
                    .where(eq(threads_table.userId, input.userId));

                await db
                    .delete(sessions)
                    .where(eq(sessions.userId, input.userId));
                await db
                    .delete(accounts)
                    .where(eq(accounts.userId, input.userId));
                await db
                    .delete(verificationTokens)
                    .where(eq(verificationTokens.identifier, input.userId));

                await db.delete(users).where(eq(users.id, input.userId));
            } catch {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to delete user account",
                });
            }
        }),
});

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

const customizationFormSchema = z.object({
    name: z.string(),
    whatDoYouDo: z.string(),
    chatTraits: z.string(),
    keepInMind: z.string(),
});

export type CustomizationFomSchema = z.infer<typeof customizationFormSchema>;

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
    addCustomization: protectedProcedure
        .input(customizationFormSchema)
        .mutation(async ({ ctx, input }) => {
            const { session, db } = ctx;
            try {
                const [oldUser] = await db
                    .select()
                    .from(users)
                    .where(eq(users.id, session.user.id));
                if (!oldUser) {
                    throw new TRPCError({
                        code: "UNAUTHORIZED",
                        message: "UNAUTHORIZED user can't add customization",
                    });
                }
                const oldCustomization = oldUser.customization;

                const newCustomization = {
                    name:
                        input.name === "" ? oldCustomization.name : input.name,
                    whatDoYouDo:
                        input.whatDoYouDo === ""
                            ? oldCustomization.whatDoYouDo
                            : input.whatDoYouDo,
                    chatTraits:
                        input.chatTraits === ""
                            ? oldCustomization.chatTraits
                            : input.chatTraits,
                    keepInMind:
                        input.keepInMind === ""
                            ? oldCustomization.keepInMind
                            : input.keepInMind,
                };

                await db
                    .update(users)
                    .set({
                        customization: newCustomization,
                    })
                    .where(eq(users.id, session.user.id));
            } catch {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to delete user account",
                });
            }
        }),
    getUserById: protectedProcedure.query(async ({ ctx }) => {
        const { session, db } = ctx;
        try {
            const [user] = await db
                .select()
                .from(users)
                .where(eq(users.id, session.user.id));

            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Users not found",
                });
            }

            return user;
        } catch {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to get user account",
            });
        }
    }),
    changeUserName: protectedProcedure.input(z.object({
        userId: z.string(),
        userName: z.string(),
    })).mutation(async ({ ctx, input }) => {
        const { session, db } = ctx;
        const { userName } = input;

        if (session.user.id !== input.userId) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "You can only delete your own account.",
            });
        }

        try {
            await db.update(users).set({
                name: userName
            }).where(eq(users.id, session.user.id));
        } catch {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to change user username",
            });
        }
    })
});

import { TRPCError } from "@trpc/server";
import { and, asc, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
    messages_table,
    projects_table,
    threads_table,
} from "~/server/db/schema";

export const projectRouter = createTRPCRouter({
    getAllProjects: protectedProcedure.query(async ({ ctx }) => {
        const { db, session } = ctx;
        try {
            const projects = await db
                .select()
                .from(projects_table)
                .where(eq(projects_table.userId, session.user.id))
                .orderBy(asc(projects_table.updatedAt));

            return projects;
        } catch {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to fetch projects",
            });
        }
    }),
    createProject: protectedProcedure
        .input(
            z.object({
                title: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { db, session } = ctx;
            const { title } = input;

            try {
                await db.insert(projects_table).values({
                    title,
                    userId: session.user.id,
                });
            } catch {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to create project",
                });
            }
        }),
    deleteProject: protectedProcedure
        .input(
            z.object({
                projectId: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { db, session } = ctx;
            const userId = session.user?.id;
            const { projectId } = input;

            try {
                const threads = await db
                    .select({ id: threads_table.id })
                    .from(threads_table)
                    .where(
                        and(
                            eq(threads_table.projectId, projectId),
                            eq(threads_table.userId, userId)
                        )
                    );

                const threadIds = threads.map((t) => t.id);

                if (threadIds.length > 0) {
                    await db
                        .delete(messages_table)
                        .where(inArray(messages_table.threadId, threadIds));

                    await db
                        .delete(threads_table)
                        .where(inArray(threads_table.id, threadIds));
                }

                await db
                    .delete(projects_table)
                    .where(
                        and(
                            eq(projects_table.id, projectId),
                            eq(projects_table.userId, userId)
                        )
                    );
            } catch {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to delete project",
                });
            }
        }),
    changeProjectTitle: protectedProcedure
        .input(
            z.object({
                title: z.string(),
                projectId: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { db, session } = ctx;
            const { title, projectId } = input;

            try {
                const result = await db
                    .update(projects_table)
                    .set({
                        title,
                        updatedAt: new Date(),
                    })
                    .where(
                        and(
                            eq(projects_table.id, projectId),
                            eq(projects_table.userId, session.user.id)
                        )
                    );

                if (result.rowCount === 0) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Project not found or unauthorized",
                    });
                }
            } catch {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to change title of project",
                });
            }
        }),
});

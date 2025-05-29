import { TRPCError } from "@trpc/server";
import { and, asc, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { projects_table } from "~/server/db/schema";

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
        } catch (error) {
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
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to create project",
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
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to change title of project",
                });
            }
        }),
    toggleProjectVisibility: protectedProcedure
        .input(z.string())
        .mutation(async ({ ctx, input }) => {
            const { db, session } = ctx;
            const userId = session.user.id;

            try {
                const project = await db.query.projects_table.findFirst({
                    where: and(
                        eq(projects_table.id, input),
                        eq(projects_table.userId, userId)
                    ),
                    columns: { visibility: true },
                });

                if (!project) {
                    throw new Error("Project not found or unauthorized.");
                }

                const newVisibility =
                    project.visibility === "private" ? "public" : "private";

                const result = await db
                    .update(projects_table)
                    .set({ visibility: newVisibility })
                    .where(
                        and(
                            eq(projects_table.id, input),
                            eq(projects_table.userId, userId)
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
                    message: "Failed to toggle visibility of project",
                });
            }
        }),
});

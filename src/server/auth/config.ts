import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "~/server/db";
import {
    accounts,
    sessions,
    users,
    verificationTokens,
} from "~/server/db/schema";
import { type CustomizationFomSchema } from "../api/routers/user";

declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string;
            customization: CustomizationFomSchema;
            isGuest?: boolean;
        } & DefaultSession["user"];
    }

    interface User {
        isGuest?: boolean;
        customization?: CustomizationFomSchema;
    }
}

export const authConfig = {
    providers: [
        GoogleProvider,
        CredentialsProvider({
            id: "guest",
            name: "Guest",
            credentials: {},
            async authorize() {
                // Create a guest user session without database storage
                return {
                    id: `guest-${crypto.randomUUID()}`,
                    email: null,
                    name: "Guest User",
                    image: null,
                    isGuest: true,
                };
            },
        }),
    ],
    adapter: DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
    }),
    session: {
        strategy: "jwt", // Switch to JWT instead of database sessions
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            // Initial sign in
            if (user) {
                token.id = user.id;
                token.isGuest = user.isGuest;
                token.customization = user.customization;
            }

            // Handle session updates (e.g., when customization changes)
            if (trigger === "update" && session) {
                if (session.customization) {
                    token.customization = session.customization;

                    // Optionally persist to database for non-guest users
                    if (!token.isGuest) {
                        // You can add database update logic here if needed
                        // await db.update(users).set({ customization: session.customization }).where(eq(users.id, token.id))
                    }
                }
            }

            return token;
        },
        async session({ session, token }) {
            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.id as string,
                    isGuest: token.isGuest as boolean | undefined,
                    customization: token.customization as
                        | CustomizationFomSchema
                        | undefined,
                },
            };
        },
    },
    pages: {
        signIn: "/auth",
    },
} satisfies NextAuthConfig;

export const providerMap = authConfig.providers
    .map((provider) => {
        if (typeof provider === "function") {
            const providerData = provider({});
            return { id: providerData.id, name: providerData.name };
        } else {
            return { id: provider.id, name: provider.name };
        }
    })
    .filter(
        (provider) => provider.id !== "credentials" && provider.id !== "guest"
    );

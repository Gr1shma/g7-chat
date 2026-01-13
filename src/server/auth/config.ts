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
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.isGuest = user.isGuest;
                token.customization = user.customization;
            }

            if (trigger === "update" && session) {
                const updatedSession = session as {
                    customization?: CustomizationFomSchema;
                };
                if (updatedSession.customization) {
                    token.customization = updatedSession.customization;
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

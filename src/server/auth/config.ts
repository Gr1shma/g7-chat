import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { db } from "~/server/db";
import {
    accounts,
    sessions,
    users,
    verificationTokens,
} from "~/server/db/schema";

declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string;
        } & DefaultSession["user"];
    }
}

export const authConfig = {
    providers: [GoogleProvider],
    adapter: DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
    }),
    callbacks: {
        session: ({ session, user }) => ({
            ...session,
            user: {
                ...session.user,
                id: user.id,
            },
        }),
    },
    pages: {
        signIn: "/auth",
    },
} satisfies NextAuthConfig;

export const providerMap = authConfig.providers
    .map((provider) => {
        const providerData = provider({});
        return { id: providerData.id, name: providerData.name };
    })
    .filter((provider) => provider.id !== "credentials");

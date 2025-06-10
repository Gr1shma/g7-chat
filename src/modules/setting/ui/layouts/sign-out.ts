"use server";

import { signOut } from "~/server/auth";

export async function serverSignOut() {
    await signOut({ redirectTo: "/" });
}

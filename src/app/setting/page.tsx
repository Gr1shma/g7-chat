import { redirect } from "next/navigation";
import { auth } from "~/server/auth";

export default async function Setting() {
    const session = await auth();
    if (!session) {
        redirect("/auth");
    } else {
        redirect("/setting/account");
    }
}

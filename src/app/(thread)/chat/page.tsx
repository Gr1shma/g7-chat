import { redirect } from "next/navigation";

import { ThreadViewSection } from "~/modules/thread/ui/views/thread-view";
import { auth } from "~/server/auth";

export const dynamic = "force-dynamic";

export default async function ThreadPage() {
    const session = await auth();
    if (!session) {
        redirect("/auth");
    }
    const threadId = crypto.randomUUID();

    return (
        <div>
            <ThreadViewSection initialMessages={[]} threadId={threadId} />
        </div>
    );
}

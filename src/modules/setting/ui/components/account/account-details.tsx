import { UserAvatar } from "~/components/user-avatar";
import KeyBoardShortCuts from "./keyboard-shortcuts";
import type { User } from "next-auth";

export default function AccountDetails({ user }: { user: User }) {
    return (
        <div className="hidden space-y-8 md:block md:w-1/4">
            <div className="text-center">
                <UserAvatar
                    imageUrl={user.image ?? ""}
                    name={user.name ?? ""}
                    size="xl"
                    className="mx-auto"
                />
                <h1 className="mt-4 text-2xl font-bold">{user.name}</h1>
                <p className="break-all text-muted-foreground">{user.email}</p>
            </div>
            <KeyBoardShortCuts />
        </div>
    );
}

"use client";

import { useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { signOut, useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function AccountTab() {
    return (
        <div className="space-y-6">
            <DeleteAccountArea />
        </div>
    );
}

function DeleteAccountArea() {
    const { data: session } = useSession();
    if (!session) {
        redirect("/auth");
    }
    const deleteMutations = api.user.deleteUserByuserId.useMutation({
        onSuccess() {
            signOut();
        },
    });

    const [open, setOpen] = useState(false);

    return (
        <div className="w-fit space-y-2 border-0 border-muted-foreground/10">
            <h2 className="text-2xl font-bold">Danger Zone</h2>
            <div className="space-y-6">
                <p className="px-px py-1.5 text-sm text-muted-foreground/80">
                    Permanently delete your account and all your data.
                </p>
                <div className="flex flex-row gap-2">
                    <AlertDialog open={open} onOpenChange={setOpen}>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                                Delete Account
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Are you absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete this thread and all its
                                    messages.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => {
                                        deleteMutations.mutate({
                                            userId: session.user.id,
                                        });
                                        setOpen(false);
                                    }}
                                >
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </div>
    );
}

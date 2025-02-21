import { Button } from "~/components/ui/button";
import { providerMap } from "~/server/auth/config";
import { AuthError } from "next-auth";
import { signIn } from "~/server/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default function Page(props: {
    searchParams: { callbackUrl: string | undefined };
}) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-800 p-8">
            <div className="mb-8 text-center">
                <h1 className="mb-2 text-3xl font-bold text-white">
                    Welcome to G7 Chat
                </h1>
                <p className="text-neutral-400">Sign in below</p>
            </div>

            <div className="w-full max-w-sm space-y-6">
                {Object.values(providerMap).map((provider) => (
                    <form
                        action={async () => {
                            "use server";
                            try {
                                await signIn(provider.id, {
                                    redirectTo:
                                        props.searchParams?.callbackUrl ?? "",
                                });
                            } catch (error) {
                                if (error instanceof AuthError) {
                                    return redirect("/");
                                }
                                throw error;
                            }
                        }}
                        key={provider.id}
                    >
                        <Button
                            variant="outline"
                            type="submit"
                            className="h-14 w-full border-neutral-700 bg-white/5 px-4 py-2 text-lg text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:text-neutral-100 hover:shadow-lg"
                        >
                            <svg
                                className="mr-3 h-6 w-6"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                ></path>
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                ></path>
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                ></path>
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                ></path>
                            </svg>
                            Continue with Google
                        </Button>
                    </form>
                ))}
            </div>
            <div className="mt-6 space-y-4 text-center text-sm text-neutral-500">
                <p>
                    By continuing, you agree to our{" "}
                    <Link
                        href="/terms"
                        className="text-neutral-400 hover:text-white"
                    >
                        Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                        href="/privacy"
                        className="text-neutral-400 hover:text-white"
                    >
                        Privacy Policy
                    </Link>
                </p>
            </div>
        </div>
    );
}

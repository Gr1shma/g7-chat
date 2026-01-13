import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GuestRateLimitStore {
    messageCount: number;
    resetAt: string | null;
    incrementMessageCount: () => void;
    getRemainingMessages: () => number;
    canSendMessage: () => boolean;
    reset: () => void;
}

const GUEST_MESSAGE_LIMIT = 10;

function getResetTime(): string {
    const tomorrow = new Date();
    tomorrow.setHours(24, 0, 0, 0);
    return tomorrow.toISOString();
}

function isExpired(resetAt: string | null): boolean {
    if (!resetAt) return true;
    return new Date(resetAt) < new Date();
}

export const useGuestRateLimitStore = create<GuestRateLimitStore>()(
    persist(
        (set, get) => ({
            messageCount: 0,
            resetAt: null,

            incrementMessageCount: () => {
                const state = get();

                if (isExpired(state.resetAt)) {
                    set({
                        messageCount: 1,
                        resetAt: getResetTime(),
                    });
                } else {
                    set({
                        messageCount: state.messageCount + 1,
                    });
                }
            },

            getRemainingMessages: () => {
                const state = get();

                if (isExpired(state.resetAt)) {
                    set({
                        messageCount: 0,
                        resetAt: getResetTime(),
                    });
                    return GUEST_MESSAGE_LIMIT;
                }

                return Math.max(0, GUEST_MESSAGE_LIMIT - state.messageCount);
            },

            canSendMessage: () => {
                const state = get();

                if (isExpired(state.resetAt)) {
                    set({
                        messageCount: 0,
                        resetAt: getResetTime(),
                    });
                    return true;
                }

                return state.messageCount < GUEST_MESSAGE_LIMIT;
            },

            reset: () => {
                set({
                    messageCount: 0,
                    resetAt: getResetTime(),
                });
            },
        }),
        {
            name: "guest-rate-limit-storage",
        }
    )
);

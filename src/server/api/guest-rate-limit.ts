import { env } from "~/env";

const guestUsageMap = new Map<string, { count: number; resetAt: Date }>();

function getNextMidnight(): Date {
    const tomorrow = new Date();
    tomorrow.setHours(24, 0, 0, 0);
    return tomorrow;
}

function cleanupExpiredEntries(): void {
    const now = new Date();
    for (const [key, value] of guestUsageMap.entries()) {
        if (value.resetAt < now) {
            guestUsageMap.delete(key);
        }
    }
}

export function getGuestUsage(guestId: string): {
    count: number;
    remaining: number;
    resetAt: Date;
    limit: number;
} {
    const limit = env.GUEST_MESSAGE_LIMIT;
    const now = new Date();
    const existing = guestUsageMap.get(guestId);

    if (!existing || existing.resetAt < now) {
        const resetAt = getNextMidnight();
        return { count: 0, remaining: limit, resetAt, limit };
    }

    return {
        count: existing.count,
        remaining: Math.max(0, limit - existing.count),
        resetAt: existing.resetAt,
        limit,
    };
}

export function canGuestSendMessage(guestId: string): boolean {
    const { remaining } = getGuestUsage(guestId);
    return remaining > 0;
}

export function incrementGuestUsage(guestId: string): {
    success: boolean;
    remaining: number;
    limit: number;
} {
    const limit = env.GUEST_MESSAGE_LIMIT;
    const now = new Date();
    const existing = guestUsageMap.get(guestId);

    if (Math.random() < 0.01) {
        cleanupExpiredEntries();
    }

    if (!existing || existing.resetAt < now) {
        guestUsageMap.set(guestId, {
            count: 1,
            resetAt: getNextMidnight(),
        });
        return { success: true, remaining: limit - 1, limit };
    }

    if (existing.count >= limit) {
        return { success: false, remaining: 0, limit };
    }

    existing.count += 1;
    guestUsageMap.set(guestId, existing);

    return {
        success: true,
        remaining: limit - existing.count,
        limit,
    };
}

export function getRemainingMessages(guestId: string): number {
    return getGuestUsage(guestId).remaining;
}

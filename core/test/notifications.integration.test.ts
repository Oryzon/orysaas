import { describe, it, expect, beforeAll } from "vitest";
import { Application } from "express";
import supertest from "supertest";
import { Equal } from "typeorm";
import { buildTestApp, authed } from "./helpers/request";
import { createUser, createNotification } from "./helpers/fixtures";
import { NotificationRepository } from "../build/core/databases/repositories/notification.repository";

// createNotification() hardcodes createdAt to now via @BeforeInsert.
// .update() skips hooks, so this forces a deterministic order for the pagination test.
async function setCreatedAt(uuid: string, date: Date): Promise<void> {
    await NotificationRepository.update({ uuid: Equal(uuid) }, { createdAt: date });
}

describe("[ Notifications ]", () => {
    let app: Application;
    let request: ReturnType<typeof supertest>;

    beforeAll(async () => {
        app = await buildTestApp();
        request = supertest(app);
    });

    it("cursor pagination returns 20 items then the rest", async () => {
        const user = await createUser();
        const base = Date.now();

        for (let i = 0; i < 25; i++) {
            const notif = await createNotification(user);
            await setCreatedAt(notif.uuid, new Date(base - i * 1000));
        }

        const firstPage = await authed(request, user).get("/v1/notifications/");

        expect(firstPage.status).toBe(200);
        expect(firstPage.body.items).toHaveLength(20);
        expect(firstPage.body.nextCursor).not.toBeNull();

        const secondPage = await authed(request, user).get(
            `/v1/notifications/?cursor=${firstPage.body.nextCursor}`,
        );

        expect(secondPage.status).toBe(200);
        expect(secondPage.body.items).toHaveLength(5);
        expect(secondPage.body.nextCursor).toBeNull();
    });

    it("totalUnread reflects the real number of unread notifications", async () => {
        const user = await createUser();

        await createNotification(user);
        await createNotification(user);
        await createNotification(user, { readAt: new Date() });

        const res = await authed(request, user).get("/v1/notifications/");

        expect(res.body.totalUnread).toBe(2);
    });

    it("marking another user's notification as read doesn't modify it", async () => {
        const userA = await createUser();
        const userB = await createUser();
        const notifOfB = await createNotification(userB);

        const res = await authed(request, userA).get(`/v1/notification/${notifOfB.uuid}/read`);

        expect(res.status).toBe(200);

        const stillUnread = await NotificationRepository.findOne({ where: { uuid: Equal(notifOfB.uuid) } });
        expect(stillUnread?.readAt).toBeNull();
    });

    it("marking all as read sets all of the user's notifications to read", async () => {
        const user = await createUser();
        const n1 = await createNotification(user);
        const n2 = await createNotification(user);
        const n3 = await createNotification(user);

        const res = await authed(request, user).get("/v1/notifications/read");
        expect(res.status).toBe(200);

        for (const notif of [n1, n2, n3]) {
            const updated = await NotificationRepository.findOne({ where: { uuid: Equal(notif.uuid) } });
            expect(updated?.readAt).not.toBeNull();
        }
    });
});

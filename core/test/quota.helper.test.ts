import { describe, it, expect } from "vitest";
import { checkQuota, incrementUsage } from "../build/core/helpers/quota.helper";
import { setupOrganizationWithQuota } from "./helpers/fixtures";
import { QuotaKey, QuotaPeriod } from "../build/shared/quota";
import Messages from "../build/core/config/messages";

describe("[ Quota Helper ]", () => {
    it("allows while usage stays under the limit, blocks once it's reached", async () => {
        const { organization } = await setupOrganizationWithQuota(QuotaKey.EMAILS_SENT, QuotaPeriod.DAILY, 2);

        expect((await checkQuota(organization.uuid, QuotaKey.EMAILS_SENT)).allowed).toBe(true);

        await incrementUsage(organization.uuid, QuotaKey.EMAILS_SENT);
        expect((await checkQuota(organization.uuid, QuotaKey.EMAILS_SENT)).allowed).toBe(true);

        await incrementUsage(organization.uuid, QuotaKey.EMAILS_SENT);
        const result = await checkQuota(organization.uuid, QuotaKey.EMAILS_SENT);

        expect(result.allowed).toBe(false);
        expect(result.message).toBe(Messages.QUOTA_EXCEEDED);
    });

    it("one organization's usage doesn't affect another's for the same key", async () => {
        const { organization: orgA } = await setupOrganizationWithQuota(QuotaKey.EMAILS_SENT, QuotaPeriod.DAILY, 1);
        const { organization: orgB } = await setupOrganizationWithQuota(QuotaKey.EMAILS_SENT, QuotaPeriod.DAILY, 1);

        await incrementUsage(orgA.uuid, QuotaKey.EMAILS_SENT);

        expect((await checkQuota(orgA.uuid, QuotaKey.EMAILS_SENT)).allowed).toBe(false);
        expect((await checkQuota(orgB.uuid, QuotaKey.EMAILS_SENT)).allowed).toBe(true);
    });
});

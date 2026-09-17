import { Equal, In } from "typeorm";
import { OrganizationMemberRepository } from "../databases/repositories/organization-member.repository";
import { OrganizationMemberRole } from "../../shared/organization-roles";
import { notificationService } from "../services/notification.service";
import { MailService } from "../services/mail.service";
import type { NotificationTypes } from "../../shared/notification-types";
import type { EmailVariant } from "./email-theme.helper";

// only owners/admins get the billing notifs + emails, regular members don't
// manage the subscription so no reason to spam them
async function getOrganizationAdmins(organizationUuid: string) {
    return OrganizationMemberRepository.find({
        where: {
            organizationUuid: Equal(organizationUuid),
            role: In([OrganizationMemberRole.OWNER, OrganizationMemberRole.ADMIN]),
        },
        relations: { member: true, organization: true },
    });
}

export async function notifyOrganizationAdmins(organizationUuid: string, type: NotificationTypes): Promise<void> {
    const admins = await getOrganizationAdmins(organizationUuid);

    for (const admin of admins) {
        await notificationService.send(admin.memberUuid, type, {
            organizationName: admin.organization.name,
        });
    }
}

export async function emailOrganizationAdmins(
    organizationUuid: string,
    template: string,
    subject: string,
    variables: Record<string, any>,
    variant?: EmailVariant,
): Promise<void> {
    const admins = await getOrganizationAdmins(organizationUuid);

    for (const admin of admins) {
        if (!admin.member?.email) {
            continue;
        }

        await new MailService().send({
            to: admin.member.email,
            subject,
            template,
            variables: {
                firstname: admin.member.firstname,
                ...variables,
            },
            variant,
        });
    }
}

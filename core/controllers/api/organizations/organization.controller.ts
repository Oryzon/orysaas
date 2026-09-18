import { Controller, Error, CheckJwt, CheckIsSaasAdmin, Get } from "../../../decorators";
import { Request, Response } from "express";
import { Equal } from "typeorm";
import HttpCode from "../../../config/http-code";
import { OrganizationRepository } from "../../../databases/repositories/organization.repository";
import { OrganizationInviteRepository } from "../../../databases/repositories/organization-invite.repository";
import { SubscriptionRepository } from "../../../databases/repositories/subscription.repository";
import { InvoiceRepository } from "../../../databases/repositories/invoice.repository";
import Messages from "../../../config/messages";

@Controller("organization")
export default class OrganizationController {
    @Get("/:slug")
    @CheckJwt()
    @CheckIsSaasAdmin()
    @Error()
    async getBySlug(req: Request, res: Response) {
        const { slug } = req.params;

        const organization = await OrganizationRepository.findOne({
            where: { slug: Equal(slug) },
            relations: {
                members: {
                    member: true,
                },
            },
        });

        if (!organization) {
            return res.status(HttpCode.NOT_FOUND).send({
                message: Messages.ORGANIZATION_NOT_FOUND,
            });
        }

        return res.status(HttpCode.OK).send(organization);
    }

    @Get("/:slug/invites")
    @CheckJwt()
    @CheckIsSaasAdmin()
    @Error()
    async pendingInvites(req: Request, res: Response) {
        const { slug } = req.params;

        const organization = await OrganizationRepository.findOneOrFail({
            where: {
                slug: Equal(slug),
            },
        });

        const invites = await OrganizationInviteRepository.findPendingByOrganization(organization.uuid);

        return res.status(HttpCode.OK).send(invites);
    }

    @Get("/:slug/billing")
    @CheckJwt()
    @CheckIsSaasAdmin()
    @Error()
    async billing(req: Request, res: Response) {
        const { slug } = req.params;

        const organization = await OrganizationRepository.findOneOrFail({
            where: {
                slug: Equal(slug),
            },
        });

        const subscription = await SubscriptionRepository.findActiveByOrganization(organization.uuid);
        const invoiceRows = await InvoiceRepository.findRecentByOrganization(organization.uuid, 5);

        // only usefull for the date
        const invoices = invoiceRows.map((invoice) => ({
            id: invoice.stripeInvoiceId,
            number: invoice.number,
            date: Math.floor(invoice.date.getTime() / 1000),
            amount: invoice.amount,
            currency: invoice.currency,
            status: invoice.status,
            hostedInvoiceUrl: invoice.hostedInvoiceUrl,
            invoicePdf: invoice.invoicePdf,
        }));

        return res
            .status(HttpCode.OK)
            .send({
                subscription,
                invoices
            });
    }
}

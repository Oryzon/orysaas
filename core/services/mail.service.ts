import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import type Mail from "nodemailer/lib/mailer";
import { EMAIL_APP_NAME, EmailVariant, getEmailTheme } from "../helpers/email-theme.helper";

interface Options {
    to: string;
    subject: string;
    template: string;
    variables: Record<string, any>;
    attachments?: Mail.Attachment[]; // <-- optional
    variant?: EmailVariant; // defaults to TEMPLATE_VARIANTS below, then 'brand' if nothing matches
}

// default color per template so we don't have to pass variant everywhere,
// can still override manually if needed
const TEMPLATE_VARIANTS: Record<string, EmailVariant> = {
    "verify-account": "brand",
    invite: "brand",
    "reset-password": "brand",
    "delete-organization": "danger",
    "delete-account-code": "danger",
    "account-deleted": "brand",
    welcome: "success",
    "subscription-started": "success",
    "subscription-cancelled": "brand",
    "payment-failed": "danger",
    invoice: "brand",
    "trial-ending": "brand",
    "contact-reply": "brand",
    example: "brand",
};

let layoutRegistered = false;

export class MailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST || "smtp.example.com",
            port: parseInt(process.env.MAIL_PORT || "587", 10),
            secure: process.env.MAIL_SECURE === "true" || process.env.MAIL_PORT === "465", // safer default
            auth: {
                user: process.env.MAIL_USER || "email@example.com",
                pass: process.env.MAIL_PASS || "password",
            },
            debug: true,
            logger: true,
        });
    }

    // shared layout every email wraps itself in with {{#> layout}} ... {{/layout}},
    // registered once as a partial called "layout". handlebars does this
    // natively so no extra package needed
    private ensureLayoutRegistered(): void {
        if (layoutRegistered) {
            return;
        }

        const layoutPath = path.join(__dirname, "../templates/emails/partials/layout.hbs");
        handlebars.registerPartial("layout", fs.readFileSync(layoutPath, "utf8"));

        layoutRegistered = true;
    }

    private getTemplateContent(templateName: string): string {
        const templatePath = path.join(__dirname, "../templates/emails", `${templateName}.hbs`);
        if (!fs.existsSync(templatePath)) {
            throw new Error(`Email template "${templateName}" not found.`);
        }
        return fs.readFileSync(templatePath, "utf8");
    }

    public async send({ to, subject, template, variables, attachments, variant }: Options): Promise<void> {
        if (process.env.NODE_ENV === "test") {
            return;
        }

        try {
            this.ensureLayoutRegistered();

            const theme = getEmailTheme(variant ?? TEMPLATE_VARIANTS[template] ?? "brand");

            const templateContent = this.getTemplateContent(template);
            const compiledTemplate = handlebars.compile(templateContent);
            const htmlContent = compiledTemplate({
                appName: EMAIL_APP_NAME,
                pageTitle: subject,
                logoUrl: process.env.HTTP_URL ? `${process.env.HTTP_URL}/logo.png` : null,
                theme,
                ...variables,
            });

            const options: Mail.Options = {
                from: process.env.MAIL_FROM || '"No Reply" <no-reply@example.com>',
                to,
                subject,
                html: htmlContent,
                ...(attachments?.length ? { attachments } : {}), // <-- only add if provided
            };

            let res = await this.transporter.sendMail(options);
            console.log(`Email sent to ${to} using template "${template}".`);
        } catch (err) {
            console.error(`Error sending email`, err);
            throw new Error("Failed to send email.");
        }
    }
}

import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import type Mail from 'nodemailer/lib/mailer';

interface Options {
    to: string;
    subject: string;
    template: string;
    variables: Record<string, any>;
    attachments?: Mail.Attachment[]; // <-- optional
}

export class MailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport(
            {
                host: process.env.MAIL_HOST || 'smtp.example.com',
                port: parseInt(process.env.MAIL_PORT || '587', 10),
                secure: process.env.MAIL_SECURE === 'true' || process.env.MAIL_PORT === '465', // safer default
                auth: {
                    user: process.env.MAIL_USER || 'email@example.com',
                    pass: process.env.MAIL_PASS || 'password',
                },
            },
            {
                debug: true,
                logger: true,
            }
        );
    }

    private getTemplateContent(templateName: string): string {
        const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.hbs`);
        if (!fs.existsSync(templatePath)) {
            throw new Error(`Email template "${templateName}" not found.`);
        }
        return fs.readFileSync(templatePath, 'utf8');
    }

    public async send({ to, subject, template, variables, attachments }: Options): Promise<void> {
        try {
            const templateContent = this.getTemplateContent(template);
            const compiledTemplate = handlebars.compile(templateContent);
            const htmlContent = compiledTemplate(variables);

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
            throw new Error('Failed to send email.');
        }
    }
}

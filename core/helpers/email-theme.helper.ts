import { brand } from "../../shared/brand";
import { shade, withAlpha } from "./color.helper";

// only the header gradient changes between variants, rest stays the same
// (bg, text etc) so the emails still feel like they're from the same app.
// add a new one here + in TEMPLATE_VARIANTS (mail.service.ts) if a template
// needs its own color
export type EmailVariant = "brand" | "success" | "danger";

export interface EmailTheme {
    bg: string;
    container: string;
    headerFrom: string;
    headerTo: string;
    textStrong: string;
    textBody: string;
    textFooter: string;
    border: string;
    badgeBg: string;
    badgeBorder: string;
    badgeText: string;
    link: string;
}

const GRADIENTS: Record<EmailVariant, [string, string]> = {
    brand: [brand.primary, brand.accent],
    success: [brand.success, shade(brand.success, -25)],
    danger: [brand.error, shade(brand.error, -25)],
};

export function getEmailTheme(variant: EmailVariant = "brand"): EmailTheme {
    const [headerFrom, headerTo] = GRADIENTS[variant];

    return {
        bg: brand.bgDark,
        container: brand.navbar,
        headerFrom,
        headerTo,
        textStrong: shade(brand.secondary, 60),
        textBody: shade(brand.secondary, 30),
        textFooter: shade(brand.secondary, -5),
        border: withAlpha("#FFFFFF", 0.06),
        badgeBg: withAlpha(brand.primary, 0.15),
        badgeBorder: withAlpha(brand.primary, 0.3),
        badgeText: brand.primary,
        link: brand.primary,
    };
}

export const EMAIL_APP_NAME = process.env.PROJECT_NAME || "OrySaas";

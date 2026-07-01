export const API_KEY_SYSTEMS = {
    STRIPE:    { label: 'Stripe' },
    SENDGRID:  { label: 'SendGrid' },
    TWILIO:    { label: 'Twilio' },
    AWS_S3:    { label: 'AWS S3' },
} as const;

export type ApiKeySystem = keyof typeof API_KEY_SYSTEMS;
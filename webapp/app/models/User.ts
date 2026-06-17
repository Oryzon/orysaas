import type { Organization } from "~/models/Organization";

export interface User {
    uuid: string;
    email: string;
    password?: string;
    origin?: string;
    firstname: string | null;
    lastname: string | null;
    isActive: boolean;
    isSaasAdmin: boolean;
    organizations: Array<Organization> | [];
    lastLogin: Date | null;
    createdAt: Date;
    updatedAt: Date | null;
}

export enum UserOrigin {
    LOCAL = "local",
    GOOGLE = "google",
    FACEBOOK = "facebook",
    MICROSOFT = "microsoft",
}

const ORIGIN_COLOR: Record<string, string> = {
    [UserOrigin.GOOGLE]:    'red-darken-2',
    [UserOrigin.MICROSOFT]: 'blue-darken-2',
    [UserOrigin.FACEBOOK]:  'indigo-darken-2',
    [UserOrigin.LOCAL]:     'teal-darken-2',
};

const ORIGIN_LABEL: Record<string, string> = {
    [UserOrigin.GOOGLE]:    'Google',
    [UserOrigin.MICROSOFT]: 'Microsoft',
    [UserOrigin.FACEBOOK]:  'Facebook',
    [UserOrigin.LOCAL]:     'Local',
};

export function getUserOriginColor(origin: unknown): string {
    return ORIGIN_COLOR[String(origin ?? '').toLowerCase()] ?? 'secondary';
}

export function getUserOriginLabel(origin: unknown): string {
    return ORIGIN_LABEL[String(origin ?? '').toLowerCase()] ?? String(origin ?? '—');
}
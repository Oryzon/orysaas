export type ApiKeyType = 'INTEGRATION' | 'CONSUMER';

export interface ApiKey {
    uuid: string;
    label: string;
    type: ApiKeyType;
    systemKey: string | null;
    value: string;
    organizationUuid: string | null;
    expiresAt: string | null;
    lastUsedAt: string | null;
    createdAt: string;
    createdBy: string;
    updatedAt: string | null;
    updatedBy: string | null;
}
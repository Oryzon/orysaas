export interface JobSetting {
    uuid: string;
    name: string;
    expression: string | null;
    isEnabled: boolean;
    isRegistered?: boolean;
    parameters: Record<string, any> | null;
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
    deletedAt: Date;
    deletedBy: string;
}
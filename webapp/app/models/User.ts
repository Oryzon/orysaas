export interface User {
    uuid: string;
    email: string;
    password?: string;
    firstname: string | null;
    lastname: string | null;
    isActive: boolean;
    isSaasAdmin: boolean;
    lastLogin: Date | null;
    createdAt: Date;
    updatedAt: Date | null;
}
export interface Role {
    uuid: string;
    name: string;
}

export interface User {
    uuid: string;
    email: string;
    password?: string;
    firstname: string | null;
    lastname: string | null;
    isActive: boolean;
    canLogIn: boolean;
    isSaasAdmin: boolean;
    lastLogin: Date | null;
    roles: Role[];
    createdAt: Date;
    updatedAt: Date | null;
}
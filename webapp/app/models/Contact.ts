export interface Contact {
    uuid: string;
    firstname: string;
    lastname: string;
    email: string;
    company: string;
    subject: string;
    message: string;
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
    deletedAt: Date;
    deletedBy: string;
}
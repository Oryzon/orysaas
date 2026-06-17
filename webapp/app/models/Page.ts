import type { Block } from "~/models/Block";

export interface Page {
    uuid: string;
    slug: string;
    title: string;
    metaTitle: string;
    metaDescription: string;
    isPublished: boolean;
    blocks: Block[];
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
    deletedAt: Date;
    deletedBy: string;
}
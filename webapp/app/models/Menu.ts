import type { MenuItem } from "~/models/MenuItem";

export interface Menu {
    uuid: string;
    key: string;
    label: string;
    isActive: boolean;
    items: Array<MenuItem>;
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
    deletedAt: Date;
    deletedBy: string;
}
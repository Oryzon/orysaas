import type { Quota } from "./Quota";

export interface Plan {
  uuid?: string;
  title: string;
  description?: string;
  purchasePrice: number;
  salePrice: number;
  isActive: boolean;
  quotas?: Quota[];
  uniqueKey?: string;
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
  deletedAt?: Date;
  deletedBy?: string;
}

export const defaultPlan = (): Plan => ({
  title: "",
  description: "",
  purchasePrice: 0,
  salePrice: 0,
  isActive: true,
});

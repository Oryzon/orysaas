import type { ApiKey } from "./ApiKey";

export interface Setting {
    siret: string;
    adress: string;
    city: string;
    postalCode: string;
    phone: string;
    email: string;
    legalForm: string;
    shareCapital: string;
    nafApeCode: string;
    identifierVat: string;
    rcsCity: string;
    apiKeys: ApiKey[];
}
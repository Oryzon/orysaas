import { ValueTransformer } from "typeorm";

export class NumericTransformer implements ValueTransformer {
    to(value: number | null): number | null {
        return value;
    }

    from(value: string | null): number | null {
        return value ? parseFloat(value) : null;
    }
}

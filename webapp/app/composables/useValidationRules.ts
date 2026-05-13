export function useValidationRules() {
    const required = (msg?: string) => (value: any) => {
        if (!msg) {
            msg = "Ce champ est obligatoire.";
        }

        if (value === null || value === undefined) {
            return msg;
        }

        if (typeof value === 'string' && value.trim() === '') {
            return msg;
        }

        if (Array.isArray(value) && value.length === 0) {
            return msg;
        }

        return true;
    }

    const minLength = (min: number, msg?: string) => (value: any) => {
        if (!msg) {
            msg = `Minimum ${min} caractères.`;
        }

        if (!value) {
            return true;
        }

        return value.length >= min || msg;
    }

    const maxLength = (max: number, msg?: string) => (value: any) => {
        if (!msg) {
            msg = `Maximum ${max} caractères.`;
        }

        if (!value) {
            return true;
        }

        return value.length <= max || msg;
    }

    const isEmail = (msg?: string) => (value: any) => {
        if (!msg) {
            msg = `L'adresse n'est pas au format e-mail.`;
        }

        if (!value) {
            return true;
        }

        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        return regex.test(value) || msg;
    }

    const isPhoneNumber = (msg?: string) => (value: any) => {
        if (!msg) {
            msg = "Le numéro de téléphone n'est pas valide.";
        }

        if (!value) {
            return true;
        }

        const regex = /^\+?[\d\s\-().]{7,20}$/;

        return regex.test(value) || msg;
    }

    const isSameAs = (getter: () => any, msg?: string) => (value: any) => {
        if (!msg) {
            msg = "Les valeurs ne correspondent pas.";
        }

        return value === getter() || msg;
    }

    const isNumber = (msg?: string) => (value: any) => {
        if (!msg) {
            msg = "Ce champ doit être un nombre.";
        }

        if (value === null || value === undefined || value === '') {
            return true;
        }

        return !isNaN(Number(value)) || msg;
    }

    return {
        required,
        minLength,
        maxLength,
        isEmail,
        isPhoneNumber,
        isSameAs,
        isNumber
    }
}
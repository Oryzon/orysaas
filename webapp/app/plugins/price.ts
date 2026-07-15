export default defineNuxtPlugin(() => {
    const toNumber = (val: number | string | null | undefined): number | null => {
        if (val == null) return null;
        if (typeof val === 'number') return Number.isFinite(val) ? val : null;

        let s = String(val)
            .trim()
            .replace(/[\u00A0\u202F]/g, ' ')   // NBSP, NNBSP → space
            .replace(/[ €$£¥]/g, '')           // drop common symbols/spaces
            .replace(/[\/]/g, '')
            .replace(/\s+/g, '');              // remove all spaces

        if (!s) return null;

        const hasComma = s.includes(',');
        const hasDot = s.includes('.');

        if (hasComma && hasDot) {
            const lastComma = s.lastIndexOf(',');
            const lastDot = s.lastIndexOf('.');

            const decimalSep = lastComma > lastDot ? ',' : '.';
            const thousandsSep = decimalSep === ',' ? '.' : ',';

            s = s.split(thousandsSep).join('');

            if (decimalSep === ',') {
                s = s.replace(',', '.');
            }
        } else if (hasComma) {
            if (/,\d{1,3}$/.test(s)) {
                s = s.replace(',', '.');
            } else {
                s = s.replace(/,/g, '');
            }
        } else if (hasDot) {
            if (/\.\d{1,3}$/.test(s)) {
                // already decimal with '.'
            } else {
                s = s.replace(/\./g, '');
            }
        }

        const n = Number(s);
        return Number.isNaN(n) ? null : n;
    };


    const price = (input: number | string) => {
        const n = toNumber(input);

        if (n == null) {
            return '';
        }

        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(n)
            .replace(/\u202F|\u00A0/g, ' ');
    }

    return {
        provide: {
            price
        }
    }
});
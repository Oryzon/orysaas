const FALLBACK = 'N.R';

export function getInitials(input: string | null | undefined): string {
    if (!input) {
        return FALLBACK;
    }

    if (typeof input === 'string') {
        const initials = input
            .split(' ')
            .filter(Boolean)
            .map(w => w.charAt(0).toUpperCase())
            .join('')
            .slice(0, 2);

        return initials || FALLBACK;
    }

    return FALLBACK;
}
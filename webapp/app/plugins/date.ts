// plugins/date.ts
import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import { DateTime, Settings } from 'luxon'

type Input = string | number | Date | null | undefined

export default defineNuxtPlugin(() => {
    const cfg = useRuntimeConfig();
    const defaultZone: string = <string>cfg.public?.defaultTimezone || 'Europe/Paris';
    const defaultLocale: string = <string>cfg.public?.defaultLocale || 'fr';

    Settings.defaultZone = defaultZone;
    Settings.defaultLocale = defaultLocale;

    function toDateTime(input: Input): DateTime | null {
        if (input === null || input === undefined || input === '') {
            return null;
        }

        // Already a Date
        if (input instanceof Date) {
            return DateTime.fromJSDate(input);
        }

        // Numbers: assume ms or sec epoch
        if (typeof input === 'number') {
            const asSec = `${input}`.length === 10;
            return asSec
                ? DateTime.fromSeconds(input)
                : DateTime.fromMillis(input);
        }

        // Strings: try ISO first
        if (typeof input === 'string') {
            // epoch seconds/millis in string form
            if (/^\d{10}$/.test(input)) {
                return DateTime.fromSeconds(Number(input));
            }

            if (/^\d{13}$/.test(input)) {
                return DateTime.fromMillis(Number(input));
            }

            // ISO or RFC-like
            const isoTry = DateTime.fromISO(input)
            if (isoTry.isValid) {
                return isoTry;
            }

            // Fallback: JS Date parsing
            const js = new Date(input);

            if (!Number.isNaN(js.getTime())) {
                return DateTime.fromJSDate(js);
            }
        }

        return null
    }

    function french(value: Input, opts?: { withTime?: boolean }) {
        const dt = toDateTime(value);

        if (!dt) {
            return '';
        }

        const withTime = opts?.withTime ?? true;

        return dt.toFormat(withTime ? 'dd/MM/yyyy à HH:mm' : 'dd/MM/yyyy');
    }

    function frenchDate(value: Input) {
        return french(value, { withTime: false });
    }

    function relative(value: Input) {
        const dt = toDateTime(value);

        if (!dt) {
            return '';
        }

        return dt.toRelative({ base: DateTime.now() }) || '';
    }

    function iso(value: Input) {
        const dt = toDateTime(value);

        if (!dt) {
            return '';
        }

        return dt.toUTC().toISO();
    }

    function format(value: Input, fmt: string) {
        const dt = toDateTime(value);

        if (!dt) {
            return '';
        }

        return dt.toFormat(fmt);
    }

    return {
        provide: {
            date: {
                french,
                frenchDate,
                relative,
                iso,
                format,
                DateTime
            }
        }
    }
})

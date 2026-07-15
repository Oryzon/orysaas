export enum QuotaKey {
    API_CALLS       = 'API_CALLS',
    API_RATE_LIMIT  = 'API_RATE_LIMIT_PER_MIN', // logique de fenêtre glissante gérée côté code
    STORAGE         = 'STORAGE',
    FILE_STORAGE    = 'FILE_STORAGE',
    MEMBERS         = 'MEMBERS', // Members available in organization
    INTEGRATIONS    = 'INTEGRATIONS',
    WEBHOOKS        = 'WEBHOOKS',
    API_KEYS        = 'API_KEYS',
    EXPORT_JOBS     = 'EXPORT_JOBS',
    EMAILS_SENT     = 'EMAILS_SENT',
    SMS_SENT        = 'SMS_SENT',
    CONCURRENT_SESSIONS = 'CONCURRENT_SESSIONS',
    AUDIT_LOG_RETENTION = 'AUDIT_LOG_RETENTION',
}

export const QuotaKeyLabel: Record<QuotaKey, string> = {
    [QuotaKey.API_CALLS]: "Appel API",
    [QuotaKey.API_RATE_LIMIT]: "Limite de débit API par minute",
    [QuotaKey.STORAGE]: "Stockage",
    [QuotaKey.FILE_STORAGE]: "Stockage de fichier",
    [QuotaKey.MEMBERS]: "Membres",
    [QuotaKey.INTEGRATIONS]: "Intégrations",
    [QuotaKey.WEBHOOKS]: "Webhooks",
    [QuotaKey.API_KEYS]: "Clés API",
    [QuotaKey.EXPORT_JOBS]: "Exports",
    [QuotaKey.EMAILS_SENT]: "Envoi d'e-mails",
    [QuotaKey.SMS_SENT]: "Envoi de SMS",
    [QuotaKey.CONCURRENT_SESSIONS]: "Sessions simultanées",
    [QuotaKey.AUDIT_LOG_RETENTION]: "Rétention des logs d'audit",
}

export enum QuotaPeriod {
    HOURLY = 'HOURLY',
    DAILY    = 'DAILY',
    WEEKLY   = 'WEEKLY',
    MONTHLY  = 'MONTHLY',
    YEARLY   = 'YEARLY',
    LIFETIME = 'LIFETIME'
}

export const QuotaPeriodLabel: Record<QuotaPeriod, string> = {
    [QuotaPeriod.HOURLY]: "Heure",
    [QuotaPeriod.DAILY]: "Journalier",
    [QuotaPeriod.WEEKLY]: "Hebdomadaire",
    [QuotaPeriod.MONTHLY]: "Mensuel",
    [QuotaPeriod.YEARLY]: "Annuel",
    [QuotaPeriod.LIFETIME]: "A vie",
}

export const QuotaPeriodPerLabel: Record<QuotaPeriod, string> = {
    [QuotaPeriod.HOURLY]: "par heure",
    [QuotaPeriod.DAILY]: "par jour",
    [QuotaPeriod.WEEKLY]: "par semaine",
    [QuotaPeriod.MONTHLY]: "par mois",
    [QuotaPeriod.YEARLY]: "par an",
    [QuotaPeriod.LIFETIME]: "a vie",
}

export enum QuotaUnit {
    MO     = "MO",
    GO     = "GO",
    CALL   = "CALL",
    NUMBER = "NUMBER",
    DAY    = "DAY",
}

export const QuotaUnitLabel: Record<QuotaUnit, string> = {
    [QuotaUnit.MO]: "Mégaoctet",
    [QuotaUnit.GO]: "Gigaoctet",
    [QuotaUnit.CALL]: "Appel",
    [QuotaUnit.NUMBER]: "Nombre",
    [QuotaUnit.DAY]: "Jour",
}
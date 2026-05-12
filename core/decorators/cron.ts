import 'reflect-metadata';

export const CRON_METADATA_KEY = 'cron_jobs';

export interface CronJobMeta {
    name: string;
    expression: string;
    handlerName: string | symbol;
}

export function Cron(name: string, expression: string, options?: { runOnStart: boolean }): MethodDecorator {
    return (target, propertyKey) => {
        const existings: CronJobMeta[] = Reflect.getMetadata(CRON_METADATA_KEY, target.constructor) || [];

        existings.push({
            name,
            expression,
            handlerName: propertyKey
        });

        Reflect.defineMetadata(CRON_METADATA_KEY, existings, target.constructor)
    }
}
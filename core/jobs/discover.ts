import { Glob } from "glob";
import fs from "fs";
import { CRON_METADATA_KEY, CronJobMeta } from "../decorators";

export interface DiscoveredJobs {
    instance: any,
    meta: CronJobMeta
}

export async function discover() {
    const discovered: DiscoveredJobs[] = [];
    const files = new Glob("jobs/**/*", {});

    for await (const file of files) {
        if (file.toLowerCase().endsWith('jobs.ts')) {
            const [exportName] = file.split('.ts');
            let tmp = await import(`../${exportName}`);

            for (const exported of Object.values(tmp)) {
                if (typeof exported !== 'function') {
                    continue;
                }

                const metas: CronJobMeta[] = Reflect.getMetadata(CRON_METADATA_KEY, exported) || [];

                if (!metas.length) {
                    continue;
                }

                const instance = new (exported as any)();

                for (const meta of metas) {
                    discovered.push({ instance, meta });

                    console.log(`[Jobs - Discover] ${meta.name} dans ${file}`);
                }
            }
        }
    }

    return discovered;
}
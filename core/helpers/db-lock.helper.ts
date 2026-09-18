import { dataSource } from "../config/datasource";

// Allow to lock something, usefull for avoid multiple runner start in same time
export async function withNamedLock<T>(lockName: string, fn: () => Promise<T>, timeoutSeconds = 10): Promise<T> {
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
        const [{ acquired }] = await queryRunner.query("SELECT GET_LOCK(?, ?) AS acquired", [
            lockName,
            timeoutSeconds,
        ]);

        if (Number(acquired) !== 1) {
            throw new Error(`Impossible d'obtenir le verrou "${lockName}", merci de réessayer.`);
        }

        try {
            return await fn();
        } finally {
            await queryRunner.query("SELECT RELEASE_LOCK(?)", [lockName]);
        }
    } finally {
        await queryRunner.release();
    }
}

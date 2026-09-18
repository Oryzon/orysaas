import { dataSource } from "../../build/core/config/datasource";

export async function resetDatabase(): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();

    try {
        await queryRunner.query("SET FOREIGN_KEY_CHECKS = 0");

        for (const entity of dataSource.entityMetadatas) {
            await queryRunner.query(`TRUNCATE TABLE \`${entity.tableName}\``);
        }

        await queryRunner.query("SET FOREIGN_KEY_CHECKS = 1");
    } finally {
        await queryRunner.release();
    }
}

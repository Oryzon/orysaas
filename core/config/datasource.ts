import path from "path";
import { DataSource } from "typeorm";
// import { AuditLogSubscriber } from "../databases/audit-log.subscriber";

const entityExt = __filename.endsWith('.ts') ? '.ts' : '.js';

export const dataSource = new DataSource({
    type: 'mariadb',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.DATASOURCE_LOGGING === '1',
    entities: [path.join(__dirname, `../databases/entities/**/*${entityExt}`)],
    // subscribers: [AuditLogSubscriber],
    charset: "utf8mb4",
});
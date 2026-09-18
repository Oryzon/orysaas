import "dotenv/config"; // so `typeorm-ts-node-commonjs` (run outside app.ts's bootstrap) still sees .env
import path from "path";
import { DataSource } from "typeorm";

const entityExt = __filename.endsWith(".ts") ? ".ts" : ".js";

export const dataSource = new DataSource({
    type: "mariadb",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    synchronize: process.env.NODE_ENV !== "production",
    logging: process.env.DATASOURCE_LOGGING === "1",
    entities: [path.join(__dirname, `../databases/entities/**/*${entityExt}`)],
    migrations: [path.join(__dirname, `../databases/migrations/**/*${entityExt}`)],
    charset: "utf8mb4",
});

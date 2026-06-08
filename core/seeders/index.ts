import "reflect-metadata";
import "dotenv/config";
import { dataSource } from "../config/datasource";
import { setRequestContext } from "../helpers/request-context.helper";
import { showcaseSeeders } from "./showcase";

const seeders: Record<string, () => Promise<void>> = {
    showcase: showcaseSeeders,
};

const name = process.argv[2];

if (!name) {
    console.error("Usage: npm run seed <seeder-name>");
    console.error("Available:", Object.keys(seeders).join(", "));

    process.exit(1);
}

if (!seeders[name]) {
    console.error(`Seeder "${name}" introuvable. Disponibles : ${Object.keys(seeders).join(", ")}`);

    process.exit(1);
}

setRequestContext({uuid: process.env.UUID_SYSTEM ?? "seeder"});

dataSource.initialize().then(async () => {
        console.log(`▶ Seeder "${name}" démarré...`);

        await seeders[name]();

        console.log(`✓ Seeder "${name}" terminé.`);
        process.exit(0);

    }).catch((err) => {
        console.error(`✗ Erreur :`, err);

        process.exit(1);
    });
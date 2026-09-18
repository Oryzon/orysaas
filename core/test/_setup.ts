if (process.env.NODE_ENV !== "test") {
    throw new Error(
        "NODE_ENV must be 'test' when running the test suite. Check core/.env.test (copy it from .env.test.example).",
    );
}

// reflect-metadata must load before any entity. Tests use the compiled
// build, not raw .ts (esbuild can't do emitDecoratorMetadata). Run via
// npm test/pretest, not bare vitest.
import "reflect-metadata";
import { afterAll, afterEach, beforeAll } from "vitest";
import { dataSource } from "../build/core/config/datasource";
import { resetDatabase } from "./helpers/db";

beforeAll(async () => {
    if (!dataSource.isInitialized) {
        await dataSource.initialize();
    }
});

afterEach(async () => {
    await resetDatabase();
});

afterAll(async () => {
    if (dataSource.isInitialized) {
        await dataSource.destroy();
    }
});

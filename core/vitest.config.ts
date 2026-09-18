import { defineConfig } from "vitest/config";
import dotenv from "dotenv";
import path from "path";

const testEnv = dotenv.config({ path: path.join(__dirname, ".env.test") }).parsed ?? {};

export default defineConfig({
    test: {
        environment: "node",
        globals: true,
        env: testEnv,
        reporters: ["verbose"],
        setupFiles: ["./test/_setup.ts"],
        testTimeout: 15000,
        hookTimeout: 15000,
        fileParallelism: false,
        server: {
            deps: {
                external: [/\/build\//],
            },
        },
    },
});

import { createApp } from "./app";
import { dataSource } from "./config/datasource";
import { Runner } from "./jobs/runner";

const SHUTDOWN_TIMEOUT_MS = 10_000;

createApp()
    .then((app) => {
        const server = app.listen(app.get("port"), () => {
            console.log(`Server is listening ${app.get("port")} port.`);
        });

        const shutdown = (signal: string) => {
            console.log(`[Server] ${signal} received, shutting down gracefully...`);

            const forceExitTimer = setTimeout(() => {
                console.error("[Server] Graceful shutdown timed out, forcing exit.");
                process.exit(1);
            }, SHUTDOWN_TIMEOUT_MS);

            Runner.stopAll();

            server.close(async () => {
                try {
                    if (dataSource.isInitialized) {
                        await dataSource.destroy();
                    }

                    clearTimeout(forceExitTimer);
                    console.log("[Server] Shutdown complete.");
                    process.exit(0);
                } catch (error) {
                    console.error("[Server] Error during shutdown:", error);
                    process.exit(1);
                }
            });
        };

        process.on("SIGTERM", () => shutdown("SIGTERM"));
        process.on("SIGINT", () => shutdown("SIGINT"));
    })
    .catch((err) => {
        console.error("Failed to start server:", err);
        process.exit(1);
    });

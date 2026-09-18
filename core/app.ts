import "reflect-metadata";
import "dotenv/config";
import express, { Application, Request, Response, Router } from "express";
import helmet from "helmet";
import cors from "cors";
import path from "path";
import { dataSource } from "./config/datasource";
import { controllers } from "./controllers/controller";
import { IRouter } from "./decorators";
import { Runner } from "./jobs/runner";
import { handleStripeWebhook } from "./webhooks/stripe.webhook";

function configuration(app: Application) {
    app.set("port", process.env.PORT || 3001);

    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",").map((o) => o.trim()) ?? [];
    app.use(
        cors({
            origin: process.env.NODE_ENV === "production" ? allowedOrigins : true,
            credentials: true,
        }),
    );

    app.use(helmet({ crossOriginResourcePolicy: false }));

    // Stripe signature verification needs the raw body — must be registered
    // before the global JSON parser below, otherwise the body is already
    // consumed/parsed by the time this route would run.
    app.post("/stripe/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

    app.use(express.json({ limit: "20mb" }));
    app.use(express.text({ limit: "5mb" }));
    app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
}

async function routes(app: Application) {
    // Database
    if (!dataSource.isInitialized) {
        await dataSource.initialize();
    }

    // Skipped in tests: no cron against a throwaway database, and it avoids
    // leaking timers across test files.
    if (process.env.NODE_ENV !== "test") {
        await Runner.init();
    }

    app.get("/", (req: Request, res: Response) => {
        res.send(`${process.env.PROJECT_NAME} - API`);
    });

    const info: Array<{
        method: string;
        path: string;
        handler: string;
    }> = [];

    const controllersToParse = await controllers();

    controllersToParse.forEach((controllerClass) => {
        const basePath = Reflect.getMetadata("base_path", controllerClass.default);
        const routers: IRouter[] = Reflect.getMetadata("routers", controllerClass.default);

        const controllerInstance = new controllerClass.default();

        const expressRouter = Router();

        if (routers) {
            routers.forEach(({ method, path, handlerName }) => {
                expressRouter[method](basePath + path, controllerInstance[handlerName].bind(controllerInstance));

                info.push({
                    method: method.toLocaleUpperCase(),
                    path: `${basePath + path}`,
                    handler: `${controllerInstance.constructor.name}.${String(handlerName)}`,
                });
            });
        }

        app.use(expressRouter);
    });

    // Route doc disponible uniquement hors production
    if (process.env.NODE_ENV !== "production") {
        app.get("/doc", (req: Request, res: Response) => {
            res.send(info);
        });
    }
}

export async function createApp(): Promise<Application> {
    const app = express();

    configuration(app);
    await routes(app);

    return app;
}

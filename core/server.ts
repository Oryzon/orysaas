import "reflect-metadata";
import "dotenv/config";
import express, { Request, Response, Router } from "express";
import helmet from "helmet";
import cors from "cors";
import path from "path";
import { dataSource } from "./config/datasource";
import { controllers } from "./controllers/controller";
import { IRouter } from "./decorators";
import { Runner } from "./jobs/runner";
import { showcaseSeeders } from "./seeders/showcase";

class Server {

    private app: express.Application;

    constructor() {
        this.app = express();
        this.configuration();
    }

    public configuration() {
        this.app.set('port', process.env.PORT || 3001);

        const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) ?? [];
        this.app.use(cors({
            origin: process.env.NODE_ENV === 'production' ? allowedOrigins : true,
            credentials: true,
        }));

        this.app.use(helmet({ crossOriginResourcePolicy: false }));
        this.app.use(express.json({ limit: '20mb' }));
        this.app.use(express.text({ limit: '5mb' }));
        this.app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
    }

    public async routes() {
        // Database
        await dataSource.initialize();

        // Cron and Runner
        await Runner.init();

        this.app.get("/", (req: Request, res: Response) => {
            res.send(`${process.env.PROJECT_NAME} - API`);
        });

        const info: Array<{
            method: string,
            path: string,
            handler: string
        }> = [];

        const controllersToParse = await controllers();

        controllersToParse.forEach((controllerClass) => {
            const basePath = Reflect.getMetadata('base_path', controllerClass.default);
            const routers: IRouter[] = Reflect.getMetadata('routers', controllerClass.default);

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

            this.app.use(expressRouter);
        });

        // Route doc disponible uniquement hors production
        if (process.env.NODE_ENV !== 'production') {
            this.app.get("/doc", (req: Request, res: Response) => {
                res.send(info);
            });
        }
    }

    public async start() {
        await this.routes();
        this.app.listen(this.app.get('port'), () => {
            console.log(`Server is listening ${this.app.get('port')} port.`);
        });
    }
}

const server = new Server();
server.start().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
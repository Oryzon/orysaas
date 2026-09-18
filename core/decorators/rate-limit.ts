import { Request, Response } from "express";
import { RateLimiterMemory, RateLimiterRes } from "rate-limiter-flexible";
import HttpCode from "../config/http-code";
import Messages from "../config/messages";

interface RateLimitOptions {
    points: number;
    duration: number; // seconds
}

export function RateLimit(options: RateLimitOptions) {
    const limiter = new RateLimiterMemory({
        points: options.points,
        duration: options.duration,
    });

    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            if (process.env.NODE_ENV === "test") {
                return originalMethod.apply(this, args);
            }

            const req = args[0] as Request;
            const res = args[1] as Response;

            try {
                await limiter.consume(req.ip ?? "unknown");
            } catch (rejection) {
                const secondsBeforeNext =
                    rejection instanceof RateLimiterRes ? Math.ceil(rejection.msBeforeNext / 1000) : undefined;

                if (secondsBeforeNext !== undefined) {
                    res.set("Retry-After", String(secondsBeforeNext));
                }

                return res
                    .status(HttpCode.TOO_MANY_REQUESTS)
                    .send({
                        message: Messages.TOO_MANY_REQUESTS,
                    });
            }

            return originalMethod.apply(this, args);
        };
    };
}

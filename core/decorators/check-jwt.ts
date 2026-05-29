import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { Equal } from "typeorm";
import HttpCode from "../config/http-code";
import { UserRepository } from "../databases/repositories/user.repository";
import { setRequestContext } from "../helpers/request-context.helper";
import { TokenExpiredError } from "jsonwebtoken";
import Messages from "../config/messages";

export function CheckJwt() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            const res = args[1] as Response;
            const req = args[0] as Request;

            let token: string = <string>req.headers["authorization"];

            if (token === undefined) {
                return res
                    .status(HttpCode.FORBIDDEN)
                    .send({
                        message: Messages.USER_NOT_AUTHED
                    });
            }

            token = token.replace("Bearer ", "");

            try {
                const jwtPayload = <any>jwt.verify(token, process.env.JWT_SECRET);
                res.locals.jwtPayload = jwtPayload;

                const user = await UserRepository.findOneOrFail({
                    where: {
                        uuid: Equal(jwtPayload.uuid)
                    },
                    select: {
                        uuid: true,
                        isActive: true,
                    },
                });

                if (!user.isActive) {
                    return res.status(HttpCode.FORBIDDEN).send({ message: Messages.USER_CAN_T_LOG_IN });
                }

                setRequestContext({
                    uuid: jwtPayload.uuid,
                });
            } catch (error) {
                if (error instanceof TokenExpiredError) {
                    return res.status(HttpCode.UNAUTHORIZED).send();
                }

                return res.status(HttpCode.UNPROCESSABLE_ENTITY).send({ message: Messages.USER_IS_LOGOUT });
            }

            return originalMethod.apply(this, args);
        }
    }
}
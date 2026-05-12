import { Request, Response } from "express";
import { EntityNotFoundError, QueryFailedError } from "typeorm";
import HttpCode from "../config/http-code";
import Messages from "../config/messages";

export function Error() {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (request: Request, response: Response) {
            try {
                await originalMethod.apply(this, [request, response]);
            } catch (error) {
                console.log(error);

                switch (true) {
                    case typeof error === 'object' && error?.error === 100:
                        if (error.error === 100) {
                            response
                                .status(HttpCode.MULTIPLE_CHOICE)
                                .send({
                                    code: 300,
                                    message: Messages.NEED_PASSWORD_RESET,
                                    uuidUser: error.uuidUser,
                                });
                        }

                        break;
                    case typeof error === 'string':
                        response
                            .status(HttpCode.UNPROCESSABLE_ENTITY)
                            .send({ message: error });
                        break;
                    case error instanceof EntityNotFoundError: {
                        const entityName = typeof error.entityClass === 'function'
                            ? error.entityClass.name
                            : String(error.entityClass);
                        response
                            .status(HttpCode.NOT_FOUND)
                            .send({ message: `The entity ${entityName} hasn't been found.` });
                        break;
                    }
                    case error instanceof QueryFailedError:
                        response
                            .status(HttpCode.UNPROCESSABLE_ENTITY)
                            .send({ message: (error as any).sqlMessage ?? error.message });
                        break;
                    default:
                        console.log(error);

                        response
                            .status(HttpCode.INTERNAL_ERROR)
                            .send({ message: 'Something wrong happened.'});
                }
            }
        }

        return descriptor;
    }
}
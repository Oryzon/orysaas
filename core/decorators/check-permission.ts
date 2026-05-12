import 'reflect-metadata';
import { Request, Response, NextFunction } from 'express';
import _ from "lodash";
import { Equal } from "typeorm";
import { UserRepository } from "../databases/repositories/user.repository";

interface CacheEntry {
    keys: Set<string>;
    expiresAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000;
const permissionCache = new Map<string, CacheEntry>();

export function clearUserPermissionCache(userUuid: string) {
    permissionCache.delete(userUuid);
}

export function clearAllPermissionCache() {
    permissionCache.clear();
}

async function getUserPermissionKeys(userUuid: string): Promise<Set<string>> {
    const cached = permissionCache.get(userUuid);

    if (cached && cached.expiresAt > Date.now()) {
        return cached.keys;
    }

    const dbUser = await UserRepository.findOne({
        where: { uuid: Equal(userUuid) },
        relations: ['roles', 'roles.permissions'],
    });

    const keys = new Set<string>(
        (dbUser?.roles ?? []).flatMap(role =>
            (role.permissions ?? []).map(p => p.key)
        )
    );

    permissionCache.set(userUuid, { keys, expiresAt: Date.now() + CACHE_TTL_MS });

    return keys;
}

export function CheckPermission() {
    return function (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        const actionName = _.snakeCase(propertyKey.toString());
        Reflect.defineMetadata('CheckPermission', actionName, target, propertyKey);

        descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
            try {
                const userUuid = res.locals.jwtPayload?.uuid;

                if (!userUuid) {
                    return res.status(401).json({ message: 'Unauthorized' });
                }

                const pageKey = Reflect.getMetadata('core_page', target.constructor);

                if (!pageKey) {
                    throw new Error('Controller metadata is missing. Make sure the controller has @Controller decorator.');
                }

                const permissionKey = `${actionName}_${pageKey}`;
                const userKeys = await getUserPermissionKeys(userUuid);

                if (!userKeys.has(permissionKey)) {
                    return res.status(403).json({ message: 'Forbidden' });
                }

                return await originalMethod.apply(this, [req, res, next]);
            } catch (error) {
                console.error('Permission check error:', error);
                return res.status(500).json({ message: 'Internal server error' });
            }
        };
    };
}
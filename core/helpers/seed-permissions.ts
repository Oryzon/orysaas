import 'reflect-metadata';
import _ from 'lodash';
import { Equal } from 'typeorm';
import { controllers } from '../controllers/controller';
import { SystemPageEntity } from '../databases/entities/system-page.entity';
import { SystemPageRepository } from '../databases/repositories/system-page.repository';
import { PermissionEntity } from '../databases/entities/permission.entity';
import { PermissionRepository } from '../databases/repositories/permission.repository';
import { IRouter } from '../decorators';

export async function seedPermissions() {
    console.log('🌱 Seeding pages and permissions...');

    const controllersToParse = await controllers();

    for (const controllerClass of controllersToParse) {
        const pageKey: string | undefined = Reflect.getMetadata('core_page', controllerClass.default);
        const routers: IRouter[] = Reflect.getMetadata('routers', controllerClass.default) ?? [];

        if (!pageKey) {
            continue;
        }

        let page = await SystemPageRepository.findOne({ where: { key: pageKey } });

        if (!page) {
            page = new SystemPageEntity();

            page.name = pageKey.charAt(0).toUpperCase() + pageKey.slice(1).toLowerCase();
            page.description = `Manage all actions about ${page.name}.`;
            page.key = pageKey;

            await SystemPageRepository.insert(page);
        }

        for (const { handlerName } of routers) {
            const hasCheckPermission = Reflect.getMetadata('CheckPermission', controllerClass.default.prototype, handlerName);

            if (!hasCheckPermission) {
                continue;
            }

            const actionName = _.snakeCase(handlerName.toString());
            const permissionKey = `${actionName}_${pageKey}`;

            let permission = await PermissionRepository.findOne({
                where: {
                    page: {
                        uuid: Equal(page.uuid)
                    },
                    key: Equal(permissionKey),
                },
            });

            if (!permission) {
                permission = new PermissionEntity();

                permission.page = page;
                permission.name = _.startCase(permissionKey);
                permission.description = `Allow the management about ${actionName} in the ${page.name} page.`;
                permission.key = permissionKey;

                await PermissionRepository.insert(permission);
            }
        }
    }

    console.log('✅ Seed permissions done.');
}

import { CheckJwt, Controller, Error, Get, Post, Put, Delete } from "../../../decorators";
import { Request, Response } from "express";
import { PageEntity } from "../../../databases/entities/page.entity";
import { PageRepository } from "../../../databases/repositories/page.repository";
import HttpCode from "../../../config/http-code";
import Messages from "../../../config/messages";
import { Equal } from "typeorm";
import { BlockRepository } from "../../../databases/repositories/block.repository";
import { BlockEntity } from "../../../databases/entities/block.entity";

@Controller('page')
export default class PageController {
    @Get('/slug/:slug')
    @Error()
    async detailWithSlug(req: Request, res: Response) {
        let slug = req.params.slug;

        let page = await PageRepository.findOne({
            where: {
                slug: Equal(slug),
            },
            relations: {
                blocks: true
            },
            order: {
                blocks: {
                    order: 'ASC'
                }
            }
        });

        return res.status(HttpCode.OK).send(page);
    }

    @Get('/:uuid')
    @CheckJwt()
    @Error()
    async detail(req: Request, res: Response) {
        let uuid = req.params.uuid;

        let page = await PageRepository.findOneOrFail({
            where: {
                uuid: Equal(uuid)
            },
            relations: {
                blocks: true
            },
            order: {
                blocks: {
                    order: 'ASC'
                }
            }
        });

        return res
            .status(HttpCode.OK)
            .send(page);
    }

    @Post('/')
    @CheckJwt()
    @Error()
    async create(req: Request, res: Response) {
        let {
            title,
            slug,
            metaTitle,
            metaDescription,
        } = req.body;

        let page = new PageEntity();

        page.title = title;
        page.slug = slug;
        page.metaTitle = metaTitle;
        page.metaDescription = metaDescription;
        page.isPublished = false;

        await PageRepository.insert(page);

        return res.status(HttpCode.OK).send({
            message: Messages.PAGE_CREATED,
            entity: page,
        });
    }

    @Put('/:uuid')
    @CheckJwt()
    @Error()
    async update(req: Request, res: Response) {
        let uuid = req.params.uuid;

        let page = await PageRepository.findOneOrFail({
            where: {
                uuid: Equal(uuid)
            },
            relations: {
                blocks: true,
            },
            order: {
                blocks: {
                    order: 'ASC'
                }
            }
        });

        let {
            title,
            slug,
            metaTitle,
            metaDescription,
            isPublished,
            blocks
        } = req.body;

        page.title = title;
        page.slug = slug;
        page.metaTitle = metaTitle;
        page.metaDescription = metaDescription;
        page.isPublished = isPublished;

        await PageRepository.save(page);

        if (blocks && Array.isArray(blocks)) {
            const newBlockUuids = blocks
                .filter(b => b.uuid)
                .map(b => b.uuid);

            const blocksToDelete = page.blocks.filter(
                existingBlock => !newBlockUuids.includes(existingBlock.uuid)
            );

            if (blocksToDelete.length > 0) {
                await BlockRepository.softRemove(blocksToDelete);
            }

            for (const blockData of blocks) {
                let block = new BlockEntity();

                if (blockData.uuid) {
                    block = await BlockRepository.findOne({
                        where: {
                            uuid: Equal(blockData.uuid)
                        }
                    });
                }

                block.page = page;
                block.type = blockData.type;
                block.order = blockData.order;
                block.data = blockData.data;
                block.visible = blockData.visible;

                await BlockRepository.save(block);
            }
        }

        const updatedPage = await PageRepository.findOne({
            where: {
                uuid: Equal(uuid)
            },
            relations: {
                blocks: true,
            },
            order: {
                blocks: {
                    order: 'ASC'
                }
            }
        });

        return res.status(HttpCode.OK).send({
            message: Messages.PAGE_UPDATED,
            entity: updatedPage
        });
    }
}
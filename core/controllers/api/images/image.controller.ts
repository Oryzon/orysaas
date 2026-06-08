import { CheckJwt, Controller, Error, Get, Post } from "../../../decorators";
import { Request, Response } from "express";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import HttpCode from "../../../config/http-code";
import Messages from "../../../config/messages";

@Controller('image')
export default class ImageController {
    @Get('/:fileName')
    @Error()
    async getImage(req: Request, res: Response) {
        const fileName = req.params.fileName;
        const filePath = path.join(__dirname, '../../../../public/uploads/images', fileName);

        if (!fs.existsSync(filePath)) {
            return res
                .status(HttpCode.NOT_FOUND)
                .send({
                    message: 'Image not found'
                });
        }

        const ext = path.extname(fileName).toLowerCase();
        const mimeTypes: Record<string, string> = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        };

        const contentType = mimeTypes[ext] || 'application/octet-stream';

        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache 1 an

        return res.sendFile(filePath);
    }

    @Post('/')
    @CheckJwt()
    @Error()
    async create(req: Request, res: Response) {
        const upload = this.getUploadMiddleware();

        // @ts-ignore
        upload.array('files', 10)(req, res, (err) => {
            if (err) {
                return res
                    .status(HttpCode.UNPROCESSABLE_ENTITY)
                    .send({
                        message: err.message
                    });
            }

            const files = req.files as Express.Multer.File[];

            if (!files || files.length === 0) {
                return res
                    .status(HttpCode.UNPROCESSABLE_ENTITY)
                    .send({
                        message: Messages.NO_FILE_SENDED
                    });
            }

            const images = files.map(file => ({
                uuid: path.parse(file.filename).name,
                filename: file.filename,
                url: `image/${file.filename}`,
                size: file.size,
                mimetype: file.mimetype,
                originalName: file.originalname
            }));

            return res
                .status(HttpCode.OK)
                .send({
                    images: images
                });
        });
    }

    private getUploadMiddleware() {
        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                const uploadDir = path.join(__dirname, '../../../../public/uploads/images');

                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }

                cb(null, uploadDir);
            },
            filename: (req, file, cb) => {
                const uuid = uuidv4();
                const ext = path.extname(file.originalname);

                cb(null, `${uuid}${ext}`);
            }
        });

        return multer({
            storage,
            limits: {
                fileSize: 10 * 1024 * 1024 // 10MB max
            },
            fileFilter: (req, file, cb) => {
                const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

                if (allowedTypes.includes(file.mimetype)) {
                    cb(null, true);
                } else {
                    cb(null, false);
                }
            }
        });
    }
}
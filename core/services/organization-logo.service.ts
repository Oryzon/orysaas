import { Request } from "express";
import { File } from "formidable";
import Jimp from "jimp";
import fs from "fs";
import path from "path";

class OrganizationLogoService {
    async save(file: File, organizationUuid: string, req: Request): Promise<string> {
        const uploadDir = path.join(process.cwd(), 'uploads', 'organizations', organizationUuid);
        fs.mkdirSync(uploadDir, { recursive: true });

        const outputPath = path.join(uploadDir, 'logo.jpg');

        const image = await Jimp.read(file.filepath);
        const background = new Jimp(image.getWidth(), image.getHeight(), 0xFFFFFFFF);
        background.composite(image, 0, 0);

        await background
            .resize(512, Jimp.AUTO)
            .quality(85)
            .writeAsync(outputPath);

        fs.unlinkSync(file.filepath);

        return `${req.protocol}://${req.get('host')}/uploads/organizations/${organizationUuid}/logo.jpg?v=${Date.now()}`;
    }
}

export const organizationLogoService = new OrganizationLogoService();

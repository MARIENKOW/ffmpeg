import { v4 } from "uuid";
import { unlink, existsSync, mkdirSync, writeFileSync } from "fs";
import path from "path";
import prisma from "./prisma.js";

class ImgService {
    save = async (img) => {
        if (!img) throw new Error("img is not found");

        const name    = img?.name || ".jpg";
        const imgName = v4() + name;

        await this.moveFile(img?.data || img, imgName);

        try {
            const filePath = process.env.NFT_FOLDER + "/" + imgName;
            const record   = await prisma.img.create({
                data: { name: imgName, path: filePath },
            });
            return { img_id: record.id, imgName, path: filePath };
        } catch (error) {
            await this.unlinkFile(imgName);
            throw error;
        }
    };

    async moveFile(img, imgName) {
        const uploadPath = path.resolve() + process.env.NFT_FOLDER;
        if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
        }
        writeFileSync(uploadPath + "/" + imgName, img);
        return uploadPath;
    }

    async unlinkFile(imgName) {
        return new Promise((res, rej) => {
            const uploadPath = path.resolve() + process.env.NFT_FOLDER;
            unlink(uploadPath + "/" + imgName, (err) => {
                if (err) return rej(err);
                res(true);
            });
        });
    }

    async delete(img_id) {
        if (!img_id) throw new Error("img_id is not found");

        const img = await prisma.img.findUnique({ where: { id: Number(img_id) } });
        if (!img) throw new Error("img is not found");

        await this.unlinkFile(img.name);
        await prisma.img.delete({ where: { id: Number(img_id) } });
        return true;
    }
}

export default new ImgService();

import { v4 } from "uuid";
import { Img } from "../models/Img.js";
import { unlink, existsSync, mkdirSync, writeFileSync } from "fs";
import path from "path";

// export const nftImageFolder = "/uploads";

class ImgService {
    save = async (img) => {
        if (!img) throw new Error("img is not found");
        const name = img?.name || ".jpg";
        const imgName = v4() + name;

        await this.moveFile(img?.data || img, imgName);

        try {
            const path = process.env.NFT_FOLDER + "/" + imgName;
            const { id: img_id } = await Img.create({ name: imgName, path });
            return { img_id, imgName, path };
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
            if (!existsSync(uploadPath)) {
                mkdirSync(uploadPath, { recursive: true });
            }
            unlink(uploadPath + "/" + imgName, (err) => {
                if (err) return rej(err);
                res(true);
            });
        });
    }

    async delete(img_id) {
        if (!img_id) throw new Error("img_id is not found");

        const { name: imgName, id } = await Img.findOne({
            where: { id: img_id },
        });

        await this.unlinkFile(imgName);

        return Img.destroy({ where: { id: img_id } });
    }
}

export default new ImgService();

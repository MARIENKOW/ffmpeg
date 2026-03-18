import { v4 } from "uuid";
import { unlink, existsSync, mkdirSync } from "fs";
import { spawn } from "child_process";
import path from "path";
import ffmpegPath from "ffmpeg-static";
import prisma from "./prisma.js";
import imgService from "./img-service.js";

class VideoService {
    save = async (video) => {
        if (!video) throw new Error("video is not found");

        const videoName = v4() + video.name;
        const videoPath = await this.moveFile(video, videoName);

        try {
            // Снять первый кадр через прямой вызов ffmpeg (без fluent-ffmpeg)
            const imgBuffer = await new Promise((resolve, reject) => {
                const buffers = [];

                // -vframes 1 -f image2 -vcodec mjpeg pipe:1
                const proc = spawn(ffmpegPath, [
                    "-i",       videoPath + "/" + videoName,
                    "-vframes", "1",
                    "-f",       "image2",
                    "-vcodec",  "mjpeg",
                    "pipe:1",
                ], { stdio: ["ignore", "pipe", "pipe"] });

                proc.stdout.on("data",  (chunk) => buffers.push(chunk));
                proc.stdout.on("end",   ()      => resolve(Buffer.concat(buffers)));
                proc.stderr.on("data",  ()      => {}); // подавляем лог ffmpeg
                proc.on("error", reject);
                proc.on("close", (code) => {
                    if (code !== 0 && buffers.length === 0) {
                        reject(new Error(`ffmpeg exited with code ${code}`));
                    }
                });
            });

            const { img_id, path: poster } = await imgService.save(imgBuffer);

            try {
                const filePath = process.env.VIDEO_FOLDER + "/" + videoName;
                const record   = await prisma.video.create({
                    data: { name: videoName, path: filePath, img_id },
                });
                return { video_id: record.id, videoName, path: filePath, poster };
            } catch (error) {
                await imgService.delete(img_id);
                throw error;
            }
        } catch (error) {
            await this.unlinkFile(videoName);
            throw error;
        }
    };

    async delete(video_id) {
        if (!video_id) throw new Error("video_id is not found");

        const video = await prisma.video.findUnique({
            where: { id: Number(video_id) },
        });
        if (!video) throw new Error("video is not found");

        await this.unlinkFile(video.name);
        await prisma.video.delete({ where: { id: Number(video_id) } });

        if (video.img_id) {
            try {
                await imgService.delete(video.img_id);
            } catch (e) {
                console.error("img delete error:", e);
            }
        }

        return video_id;
    }

    async moveFile(video, videoName) {
        return new Promise((res, rej) => {
            const uploadPath = path.resolve() + process.env.VIDEO_FOLDER;
            if (!existsSync(uploadPath)) {
                mkdirSync(uploadPath, { recursive: true });
            }
            video.mv(uploadPath + "/" + videoName, (err) => {
                if (err) return rej(err);
                res(uploadPath);
            });
        });
    }

    async unlinkFile(videoName) {
        return new Promise((res, rej) => {
            const uploadPath = path.resolve() + process.env.VIDEO_FOLDER;
            unlink(uploadPath + "/" + videoName, (err) => {
                if (err) return rej(err);
                res(true);
            });
        });
    }
}

export default new VideoService();

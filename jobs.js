const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const prisma = require("./prisma");
const { downloadFromGDrive } = require("./downloader");
const { addWatermark, addWatermarkAndTrim } = require("./ffmpeg");
const {
    sendShortVideo,
    sendFullVideo,
    sendErrorToAdmin,
} = require("./telegram");

const VIDEOS_DIR = path.resolve(process.env.VIDEOS_DIR || "./storage/videos");
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const TRIM_DURATION = Number(process.env.TRIM_DURATION || 20);

router.post("/", async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'Поле "url" обязательно' });
    }

    res.status(202).json(true);

    setImmediate(() => processJob(url, TRIM_DURATION, jobDir));
});

async function processJob(driveUrl, trimDuration) {
    let sourcePath = null;
    const id = uuidv4();

    // Обёртка: запускает шаг, при ошибке уведомляет админа и пробрасывает дальше
    const step = async (stageName, fn) => {
        try {
            return await fn();
        } catch (err) {
            await sendErrorToAdmin(id, stageName, err.message);
            throw err;
        }
    };

    try {
        const jobDir = path.join(VIDEOS_DIR, id);
        fs.mkdirSync(jobDir, { recursive: true });

        const tmpDir = path.join(VIDEOS_DIR, "__tmp__");
        fs.mkdirSync(tmpDir, { recursive: true });

        // Шаг 1 — скачивание
        console.log(`[job:${id}] Скачиваю: ${driveUrl}`);
        sourcePath = await step("📥 Скачивание с Google Drive", () =>
            downloadFromGDrive(driveUrl, tmpDir),
        );
        console.log(`[job:${id}] Скачано: ${sourcePath}`);

        const shortPath = path.join(jobDir, `short_${id}.mp4`);
        const fullPath = path.join(jobDir, `full_${id}.mp4`);

        // Шаг 2 — обработка ffmpeg
        console.log(`[job:${id}] Запускаю ffmpeg...`);
        await step("🎬 Обработка ffmpeg", () =>
            Promise.all([
                addWatermarkAndTrim(sourcePath, shortPath, trimDuration),
                addWatermark(sourcePath, fullPath),
            ]),
        );
        console.log(`[job:${id}] ffmpeg завершён`);

        // Шаг 4 — отправка в Telegram (каждый канал независимо)
        console.log(`[job:${id}] Отправляю в Telegram...`);
        await Promise.all([
            step("📤 Отправка короткого видео в Telegram", () =>
                sendShortVideo(shortPath),
            ).then(() => console.log(`[job:${id}] Short → Telegram ✓`)),
            step("📤 Отправка полного видео в Telegram", () =>
                sendFullVideo(fullPath),
            ).then(() => console.log(`[job:${id}] Full  → Telegram ✓`)),
        ]);
        fs.unlinkSync(sourcePath);
        console.log(`[job:${id}] Исходник удалён`);
    } catch (err) {
        console.error(`[job:${id}] Ошибка:`, err.message);

        if (sourcePath && fs.existsSync(sourcePath)) {
            try {
                fs.unlinkSync(sourcePath);
            } catch (_) {}
        }
    }
}

module.exports = router;

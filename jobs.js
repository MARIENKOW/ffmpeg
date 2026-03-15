const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const prisma = require("./prisma");
const { downloadFromGDrive } = require("./downloader");
const { addWatermark, addWatermarkAndTrim } = require("./ffmpeg");

const VIDEOS_DIR = path.resolve(process.env.VIDEOS_DIR || "./storage/videos");
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const trimDuration = 20;

// ─────────────────────────────────────────────────────────────────
// POST /api/jobs
// Body: { "url": "https://drive.google.com/...", "trimDuration": 30 }
// ─────────────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'Поле "url" обязательно' });
    }
    if (
        !trimDuration ||
        isNaN(Number(trimDuration)) ||
        Number(trimDuration) <= 0
    ) {
        return res.status(400).json({
            error: 'Поле "trimDuration" должно быть положительным числом (секунды)',
        });
    }

    // Создаём задачу в БД — Prisma сгенерирует UUID и проставит статус PENDING
    const job = await prisma.job.create({
        data: {}, // id = uuid(), status = PENDING, createdAt/updatedAt — авто
    });

    // Сразу отвечаем клиенту
    res.status(202).json({ id: job.id });

    // Обработка в фоне
    const jobDir = path.join(VIDEOS_DIR, job.id);
    setImmediate(() => processJob(job.id, url, Number(trimDuration), jobDir));
});

// ─────────────────────────────────────────────────────────────────
// GET /api/jobs/:id — статус задачи
// ─────────────────────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
    const job = await prisma.job.findUnique({
        where: { id: req.params.id },
    });

    if (!job) return res.status(404).json({ error: "Задача не найдена" });

    const payload = {
        id: job.id,
        status: job.status, // PENDING | SUCCESS | ERROR
        created_at: job.createdAt,
        updated_at: job.updatedAt,
    };

    if (job.status === "SUCCESS") {
        payload.short_url = job.shortUrl;
        payload.full_url = job.fullUrl;
    }
    if (job.status === "ERROR") {
        payload.error = job.error;
    }

    res.json(payload);
});

// ─────────────────────────────────────────────────────────────────
// GET /api/jobs/:id/download/:type   type = short | full
// Отдаёт файл и удаляет его после передачи
// ─────────────────────────────────────────────────────────────────
router.get("/:id/download/:type", async (req, res) => {
    const { id, type } = req.params;

    if (!["short", "full"].includes(type)) {
        return res
            .status(400)
            .json({ error: 'type должен быть "short" или "full"' });
    }

    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) return res.status(404).json({ error: "Задача не найдена" });

    if (job.status !== "SUCCESS") {
        return res.status(409).json({
            error: `Задача в статусе "${job.status}", файлы ещё не готовы`,
        });
    }

    const filePath = type === "short" ? job.shortPath : job.fullPath;

    if (!filePath) {
        return res.status(410).json({ error: "Файл уже был скачан и удалён" });
    }
    if (!fs.existsSync(filePath)) {
        // Файл пропал — чистим поле в БД
        await prisma.job.update({
            where: { id },
            data: type === "short" ? { shortPath: null } : { fullPath: null },
        });
        return res.status(410).json({ error: "Файл не найден на диске" });
    }

    res.setHeader(
        "Content-Disposition",
        `attachment; filename="${type}_${id}.mp4"`,
    );
    res.setHeader("Content-Type", "video/mp4");

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);

    // После завершения передачи — удаляем файл, обнуляем путь в БД
    stream.on("end", async () => {
        try {
            fs.unlinkSync(filePath);
            console.log(`[download] Удалён файл: ${filePath}`);

            const updatedJob = await prisma.job.update({
                where: { id },
                data:
                    type === "short" ? { shortPath: null } : { fullPath: null },
            });

            // Если оба файла скачаны — удаляем папку задачи
            if (!updatedJob.shortPath && !updatedJob.fullPath) {
                const jobDir = path.join(VIDEOS_DIR, id);
                fs.rmSync(jobDir, { recursive: true, force: true });
                console.log(`[download] Папка задачи удалена: ${jobDir}`);
            }
        } catch (e) {
            console.error("[download] Ошибка при удалении:", e.message);
        }
    });

    stream.on("error", (err) => {
        console.error("[download] Ошибка стрима:", err.message);
        if (!res.headersSent) res.status(500).end();
    });
});

async function processJob(id, driveUrl, trimDuration, jobDir) {
    let sourcePath = null;

    try {
        fs.mkdirSync(jobDir, { recursive: true });

        const tmpDir = path.join(VIDEOS_DIR, "__tmp__");
        fs.mkdirSync(tmpDir, { recursive: true });

        console.log(`[job:${id}] Скачиваю видео: ${driveUrl}`);
        sourcePath = await downloadFromGDrive(driveUrl, tmpDir);
        console.log(`[job:${id}] Скачано: ${sourcePath}`);

        const shortPath = path.join(jobDir, "short.mp4");
        const fullPath = path.join(jobDir, "full.mp4");

        console.log(`[job:${id}] Запускаю ffmpeg (параллельно)...`);
        await Promise.all([
            addWatermarkAndTrim(sourcePath, shortPath, trimDuration),
            addWatermark(sourcePath, fullPath),
        ]);
        console.log(`[job:${id}] ffmpeg завершён`);

        // Удаляем исходник
        fs.unlinkSync(sourcePath);
        console.log(`[job:${id}] Исходник удалён`);

        const shortUrl = `${BASE_URL}/api/jobs/${id}/download/short`;
        const fullUrl = `${BASE_URL}/api/jobs/${id}/download/full`;

        await prisma.job.update({
            where: { id },
            data: {
                status: "SUCCESS",
                shortPath,
                fullPath,
                shortUrl,
                fullUrl,
            },
        });

        console.log(`[job:${id}] Статус → SUCCESS`);
    } catch (err) {
        console.error(`[job:${id}] Ошибка:`, err.message);

        // if (sourcePath && fs.existsSync(sourcePath)) {
        //     try {
        //         fs.unlinkSync(sourcePath);
        //     } catch (_) {}
        // }

        await prisma.job.update({
            where: { id },
            data: { status: "ERROR", error: err.message },
        });
    }
}

module.exports = router;

import fs from "fs";
import path from "path";
import prisma from "./prisma.js";
import { addWatermark, addWatermarkAndTrim } from "./ffmpeg-service.js";
import { sendShortVideo, sendFullVideo, sendErrorToAdmin } from "./telegram-video.js";

const TRIM_DURATION = Number(process.env.TRIM_DURATION || 20);
const INTERVAL_MS   = Number(process.env.SCHEDULER_INTERVAL_MS || 10 * 60 * 1000); // 10 минут

// Лок — не запускаем два job'а одновременно
let isRunning = false;

// ─── Один цикл обработки ─────────────────────────────────────────

async function processNextVideo() {
    if (isRunning) {
        console.log("[scheduler] Пропускаю — предыдущий job ещё выполняется");
        return;
    }

    isRunning = true;
    console.log("[scheduler] Запуск...");

    // Временная папка для обработанных файлов
    const tmpDir = path.join(path.resolve(), process.env.VIDEO_FOLDER, "__processed__");
    fs.mkdirSync(tmpDir, { recursive: true });

    let video = null;

    try {
        // Берём самое старое видео у которого есть постер
        video = await prisma.video.findFirst({
            include: { img: true },
            orderBy: { id: "asc" },
            where:   { img: { isNot: null } },
        });

        if (!video) {
            console.log("[scheduler] Нет видео для обработки");
            return;
        }

        console.log(`[scheduler] Обрабатываю video id=${video.id} — ${video.name}`);

        // Полный путь к исходному файлу
        const sourcePath = path.join(path.resolve(), video.path);

        if (!fs.existsSync(sourcePath)) {
            console.warn(`[scheduler] Файл не найден: ${sourcePath}, удаляю запись из БД`);
            await deleteVideoRecord(video.id);
            return;
        }

        const shortPath = path.join(tmpDir, `short_${video.id}.mp4`);
        const fullPath  = path.join(tmpDir, `full_${video.id}.mp4`);

        // Шаг 1 — ffmpeg: обрезка+вотермарка и полное+вотермарка параллельно
        console.log(`[scheduler] ffmpeg...`);
        await step("🎬 Обработка ffmpeg", async () =>
            Promise.all([
                addWatermarkAndTrim(sourcePath, shortPath, TRIM_DURATION),
                addWatermark(sourcePath, fullPath),
            ])
        );
        console.log(`[scheduler] ffmpeg завершён`);

        // Шаг 2 — отправка в Telegram (оба канала параллельно)
        console.log(`[scheduler] Отправка в Telegram...`);
        await step("📤 Отправка в Telegram", async () =>
            Promise.all([
                sendShortVideo(shortPath).then(() => console.log("[scheduler] Short → Telegram ✓")),
                sendFullVideo(fullPath).then(()  => console.log("[scheduler] Full  → Telegram ✓")),
            ])
        );

        // Шаг 3 — удаляем всё
        console.log(`[scheduler] Удаление...`);
        await deleteVideoRecord(video.id);   // удаляет файл + запись в БД + постер
        cleanupTmp(shortPath, fullPath);
        console.log(`[scheduler] video id=${video.id} — готово ✓`);

    } catch (err) {
        console.error(`[scheduler] Ошибка:`, err.message);
        // Чистим временные файлы если есть
        if (video) {
            cleanupTmp(
                path.join(tmpDir, `short_${video.id}.mp4`),
                path.join(tmpDir, `full_${video.id}.mp4`),
            );
        }
    } finally {
        isRunning = false;
    }
}

// ─── Удаление записи + файла видео + постера из БД и диска ───────

async function deleteVideoRecord(videoId) {
    const video = await prisma.video.findUnique({ where: { id: videoId } });
    if (!video) return;

    // Удаляем физический файл видео
    const filePath = path.join(path.resolve(), video.path);
    if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) { console.warn("[scheduler] unlink video:", e.message); }
    }

    // Удаляем запись видео
    await prisma.video.delete({ where: { id: videoId } });

    // Удаляем постер (img)
    if (video.img_id) {
        const img = await prisma.img.findUnique({ where: { id: video.img_id } });
        if (img) {
            const imgPath = path.join(path.resolve(), img.path);
            if (fs.existsSync(imgPath)) {
                try { fs.unlinkSync(imgPath); } catch (e) { console.warn("[scheduler] unlink img:", e.message); }
            }
            await prisma.img.delete({ where: { id: video.img_id } });
        }
    }
}

// ─── Удаление временных обработанных файлов ──────────────────────

function cleanupTmp(...paths) {
    for (const p of paths) {
        if (fs.existsSync(p)) {
            try { fs.unlinkSync(p); } catch (_) {}
        }
    }
}

// ─── Обёртка шага с уведомлением об ошибке ───────────────────────

async function step(stageName, fn) {
    try {
        return await fn();
    } catch (err) {
        await sendErrorToAdmin(stageName, err.message);
        throw err;
    }
}

// ─── Запуск планировщика ─────────────────────────────────────────

export function startScheduler() {
    console.log(`[scheduler] Запущен, интервал: ${INTERVAL_MS / 1000}с`);

    // Первый запуск сразу при старте сервера
    processNextVideo();

    // Затем по интервалу
    setInterval(processNextVideo, INTERVAL_MS);
}

const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
const path = require("path");

ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH || ffmpegStatic);

const WATERMARK_PATH =
    process.env.WATERMARK_PATH ||
    path.join(__dirname, "..", "assets", "watermark.png");

// Вотермарка займёт 20% ширины видео — меняйте под себя
const WATERMARK_SCALE = process.env.WATERMARK_SCALE || "0.20";

/**
 * Базовая сборка команды с вотермаркой.
 * extraArgs — доп. outputOptions (например -t 30 для обрезки).
 */
const buildCommand = (inputPath, outputPath, extraArgs = []) => {
    const wmScale = parseFloat(WATERMARK_SCALE);

    return ffmpeg(inputPath)
        .input(WATERMARK_PATH)
        .complexFilter([
            // 1. Нормализуем видео: чётные размеры + квадратные пиксели
            //    trunc(iw/2)*2 — округление до чётного, aspect ratio НЕ меняется
            "[0:v] scale=trunc(iw/2)*2:trunc(ih/2)*2, setsar=1 [base]",

            // 2. Масштабируем вотермарку до N% ширины видео
            //    -2 в высоте = сохранить пропорции вотермарки, чётное значение
            `[1:v] scale=iw*${wmScale}:-2 [wm]`,

            // 3. Накладываем вотермарку: правый нижний угол, отступ 2% от края
            "[base][wm] overlay=W-w-W*0.02:H-h-H*0.02, setsar=1 [v]",
        ])
        .outputOptions([
            "-map [v]",
            "-map 0:a?", // аудио если есть, иначе пропускаем
            "-codec:a copy",
            "-codec:v libx264",
            "-preset fast",
            "-crf 23",
            "-pix_fmt yuv420p", // совместимость с Telegram / iOS / Android
            ...extraArgs,
        ])
        .output(outputPath);
};

/**
 * Добавляет вотермарку без обрезки (full-версия).
 */
const addWatermark = (inputPath, outputPath) => {
    return new Promise((resolve, reject) => {
        buildCommand(inputPath, outputPath)
            .on("start", (cmd) => console.log("[ffmpeg:full] start:", cmd))
            .on("end", () => {
                console.log("[ffmpeg:full] done");
                resolve(outputPath);
            })
            .on("error", (err) => {
                console.error("[ffmpeg:full] error:", err.message);
                reject(err);
            })
            .run();
    });
};

/**
 * Добавляет вотермарку + обрезает до durationSec секунд (short-версия).
 */
const addWatermarkAndTrim = (inputPath, outputPath, durationSec) => {
    return new Promise((resolve, reject) => {
        buildCommand(inputPath, outputPath, [`-t ${durationSec}`])
            .on("start", (cmd) => console.log("[ffmpeg:short] start:", cmd))
            .on("end", () => {
                console.log("[ffmpeg:short] done");
                resolve(outputPath);
            })
            .on("error", (err) => {
                console.error("[ffmpeg:short] error:", err.message);
                reject(err);
            })
            .run();
    });
};

module.exports = { addWatermark, addWatermarkAndTrim };

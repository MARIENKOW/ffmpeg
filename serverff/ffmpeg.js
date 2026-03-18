const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
const ffprobeStatic = require("ffprobe-static");
const path = require("path");

ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH || ffmpegStatic);
ffmpeg.setFfprobePath(process.env.FFPROBE_PATH || ffprobeStatic.path);

const WATERMARK_PATH =
    process.env.WATERMARK_PATH ||
    path.join(__dirname, "..", "assets", "watermark.png");
const WATERMARK_SCALE = parseFloat(process.env.WATERMARK_SCALE || "0.80");

// ─── ffprobe: получаем реальные display-размеры видео ────────────
const getVideoSize = (inputPath) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(inputPath, (err, meta) => {
            if (err) return reject(err);

            const stream = meta.streams.find((s) => s.codec_type === "video");
            if (!stream) return reject(new Error("Видеопоток не найден"));

            let w = stream.width;
            const h = stream.height;

            // Компенсируем несквадратный SAR
            const sar = stream.sample_aspect_ratio;
            if (sar && sar !== "1:1" && sar !== "0:1") {
                const [sarW, sarH] = sar.split(":").map(Number);
                if (sarW > 0 && sarH > 0) w = Math.round((w * sarW) / sarH);
            }

            // libx264 требует чётных размеров
            resolve({
                width: Math.floor(w / 2) * 2,
                height: Math.floor(h / 2) * 2,
            });
        });
    });
};

// ─── Вычисляем размер вотермарки в JS ────────────────────────────
const calcWatermarkSize = (videoW, videoH) => {
    // Берём N% от меньшей стороны
    const base = Math.min(videoW, videoH);
    let wmW = Math.round(base * WATERMARK_SCALE);

    // Не даём вылезти за 90% любой из сторон
    wmW = Math.min(wmW, Math.floor(videoW * 0.9));
    wmW = Math.min(wmW, Math.floor(videoH * 0.9));

    // libx264 требует чётного
    wmW = Math.floor(wmW / 2) * 2;

    return wmW; // высоту ffmpeg посчитает сам через -2 (сохранит пропорции)
};

// ─── Базовая сборка команды ───────────────────────────────────────
const buildCommand = (
    inputPath,
    outputPath,
    videoW,
    videoH,
    extraArgs = [],
) => {
    const wmW = calcWatermarkSize(videoW, videoH);

    console.log(
        `[ffmpeg] video: ${videoW}x${videoH}, watermark width: ${wmW}px`,
    );

    return ffmpeg(inputPath)
        .input(WATERMARK_PATH)
        .complexFilter([
            // 1. Нормализуем видео до реальных display-размеров, SAR → 1:1
            `[0:v] scale=${videoW}:${videoH},setsar=1 [base]`,
            // 2. Масштабируем вотермарку — конкретные пиксели, никакой магии
            `[1:v] scale=${wmW}:-2 [wm]`,
            // 3. Правый нижний угол, отступ 2% от края
            "[base][wm] overlay=W-w-W*0.02:H-h-H*0.02 [v]",
        ])
        .outputOptions([
            "-map [v]",
            "-map 0:a?",
            "-codec:a copy",
            "-codec:v libx264",
            "-preset fast",
            "-crf 23",
            "-pix_fmt yuv420p",
            ...extraArgs,
        ])
        .output(outputPath);
};

// ─── Публичные функции ────────────────────────────────────────────
const addWatermark = async (inputPath, outputPath) => {
    const { width, height } = await getVideoSize(inputPath);

    return new Promise((resolve, reject) => {
        buildCommand(inputPath, outputPath, width, height)
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

const addWatermarkAndTrim = async (inputPath, outputPath, durationSec) => {
    const { width, height } = await getVideoSize(inputPath);

    return new Promise((resolve, reject) => {
        buildCommand(inputPath, outputPath, width, height, [
            `-t ${durationSec}`,
        ])
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

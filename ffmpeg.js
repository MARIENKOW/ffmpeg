const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
const path = require("path");

ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH || ffmpegStatic);

const WATERMARK_PATH =
    process.env.WATERMARK_PATH ||
    path.join(__dirname, "..", "assets", "watermark.png");

// Вотермарка = 20% от меньшей стороны видео, но не больше 90% ни одной из сторон
const WATERMARK_SCALE = parseFloat(process.env.WATERMARK_SCALE || "0.80");

const buildCommand = (inputPath, outputPath, extraArgs = []) => {
    return ffmpeg(inputPath)
        .input(WATERMARK_PATH)
        .complexFilter([
            // 1. Нормализуем пиксели и размеры
            "[0:v] scale=trunc(iw*sar/2)*2:trunc(ih/2)*2,setsar=1 [base]",

            // 2. Масштабируем вотермарку:
            //    - берём min(ширина, высота) видео → N% от него
            //    - ограничиваем: не шире 90% видео и не выше 90% видео
            //    -2 = сохранить пропорции вотермарки с чётным значением
            `[1:v] scale='min(min(${WATERMARK_SCALE}*min(W\\,H)\\, W*0.9)\\, -2)':'min(min(${WATERMARK_SCALE}*min(W\\,H)\\, H*0.9)\\, -2)',setsar=1 [wm]`,

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

const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
const path = require("path");

ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH || ffmpegStatic);

const WATERMARK_PATH =
    process.env.WATERMARK_PATH ||
    path.join(__dirname, "..", "assets", "watermark.png");

const WATERMARK_SCALE = process.env.WATERMARK_SCALE || "0.8";

const buildCommand = (inputPath, outputPath, extraArgs = []) => {
    const wmScale = parseFloat(WATERMARK_SCALE);

    return ffmpeg(inputPath)
        .input(WATERMARK_PATH)
        .complexFilter([
            // 1. Компенсируем несквадратные пиксели: умножаем ширину на SAR,
            //    затем выставляем SAR=1. Это сохраняет визуальные пропорции.
            //    trunc(...)*2 — чётные размеры, libx264 требует чётных.
            "[0:v] scale=trunc(iw*sar/2)*2:trunc(ih/2)*2,setsar=1 [base]",

            // 2. Масштабируем вотермарку до N% ширины видео
            `[1:v] scale=iw*${wmScale}:-2 [wm]`,

            // 3. Накладываем вотермарку: правый нижний угол, отступ 2% от края
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

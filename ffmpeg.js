const ffmpeg = require("fluent-ffmpeg");
const path = require("path");

const WATERMARK_PATH =
    process.env.WATERMARK_PATH ||
    path.join(__dirname, "..", "assets", "watermark.png");

/**
 * Добавляет вотермарку без обрезки (full-версия).
 */
const addWatermark = (inputPath, outputPath) => {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .input(WATERMARK_PATH)
            .complexFilter(["[0:v][1:v] overlay=W-w-10:H-h-10"])
            .outputOptions(["-codec:a copy", "-preset fast", "-crf 23"])
            .output(outputPath)
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
        ffmpeg(inputPath)
            .input(WATERMARK_PATH)
            .complexFilter(["[0:v][1:v] overlay=W-w-10:H-h-10"])
            .outputOptions([
                `-t ${durationSec}`,
                "-codec:a copy",
                "-preset fast",
                "-crf 23",
            ])
            .output(outputPath)
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

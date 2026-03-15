const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
const path = require("path");

ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH || ffmpegStatic);

const WATERMARK_PATH =
    process.env.WATERMARK_PATH ||
    path.join(__dirname, "..", "assets", "watermark.png");

const WATERMARK_SCALE = process.env.WATERMARK_SCALE || "0.80";

/**
 * Получаем реальные display-размеры видео через ffprobe.
 * SAR может быть не 1:1 — тогда coded_width != display_width.
 */
const getDisplaySize = (inputPath) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(inputPath, (err, metadata) => {
            if (err) return reject(err);

            const stream = metadata.streams.find(
                (s) => s.codec_type === "video",
            );
            if (!stream) return reject(new Error("Видеопоток не найден"));

            let displayWidth = stream.width;
            const displayHeight = stream.height;

            // Если SAR задан и не квадратный — пересчитываем ширину
            const sar = stream.sample_aspect_ratio; // например "4:3" или "1:1"
            if (sar && sar !== "1:1" && sar !== "0:1") {
                const [sarW, sarH] = sar.split(":").map(Number);
                if (sarW > 0 && sarH > 0) {
                    displayWidth = Math.round((stream.width * sarW) / sarH);
                }
            }

            // libx264 требует чётных размеров
            const w = Math.floor(displayWidth / 2) * 2;
            const h = Math.floor(displayHeight / 2) * 2;

            console.log(
                `[ffprobe] coded: ${stream.width}x${stream.height}, SAR: ${sar}, display: ${w}x${h}`,
            );
            resolve({ width: w, height: h });
        });
    });
};

/**
 * Базовая сборка команды.
 * Принимает уже вычисленные display-размеры — никакой магии в фильтре.
 */
const buildCommand = (inputPath, outputPath, width, height, extraArgs = []) => {
    const wmScale = parseFloat(WATERMARK_SCALE);

    return ffmpeg(inputPath)
        .input(WATERMARK_PATH)
        .complexFilter([
            // 1. Масштабируем к точным display-размерам, SAR → 1:1
            `[0:v] scale=${width}:${height},setsar=1 [base]`,

            // 2. Масштабируем вотермарку до N% ширины
            `[1:v] scale=${width}*${wmScale}:-2 [wm]`,

            // 3. Накладываем вотермарку: правый нижний угол, отступ 2%
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

/**
 * Добавляет вотермарку без обрезки (full-версия).
 */
const addWatermark = async (inputPath, outputPath) => {
    const { width, height } = await getDisplaySize(inputPath);

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

/**
 * Добавляет вотермарку + обрезает до durationSec секунд (short-версия).
 */
const addWatermarkAndTrim = async (inputPath, outputPath, durationSec) => {
    const { width, height } = await getDisplaySize(inputPath);

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

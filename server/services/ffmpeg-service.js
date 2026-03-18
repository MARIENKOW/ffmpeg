import { spawn } from "child_process";
import path from "path";
import ffmpegPath from "ffmpeg-static";
import ffprobeStatic from "ffprobe-static";

const WATERMARK_PATH =
    process.env.WATERMARK_PATH ||
    path.join(path.resolve(), "assets", "watermark.png");

const WATERMARK_SCALE = parseFloat(process.env.WATERMARK_SCALE || "0.80");

// ─── ffprobe: получаем реальные display-размеры видео ────────────

export function getVideoSize(inputPath) {
    return new Promise((resolve, reject) => {
        const proc = spawn(ffprobeStatic.path, [
            "-v", "quiet",
            "-print_format", "json",
            "-show_streams",
            inputPath,
        ]);

        let out = "";
        proc.stdout.on("data", (chunk) => (out += chunk));
        proc.on("error", reject);
        proc.on("close", (code) => {
            if (code !== 0) return reject(new Error(`ffprobe exited with code ${code}`));
            try {
                const meta   = JSON.parse(out);
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

                resolve({
                    width:  Math.floor(w / 2) * 2,
                    height: Math.floor(h / 2) * 2,
                });
            } catch (e) {
                reject(e);
            }
        });
    });
}

// ─── Вычисляем ширину вотермарки ──────────────────────────────────

function calcWatermarkWidth(videoW, videoH) {
    const base = Math.min(videoW, videoH);
    let wmW    = Math.round(base * WATERMARK_SCALE);
    wmW        = Math.min(wmW, Math.floor(videoW * 0.9));
    wmW        = Math.min(wmW, Math.floor(videoH * 0.9));
    return Math.floor(wmW / 2) * 2;
}

// ─── Базовая обёртка spawn ffmpeg ─────────────────────────────────

function runFfmpeg(args, label) {
    return new Promise((resolve, reject) => {
        console.log(`[ffmpeg:${label}] start`);
        const proc = spawn(ffmpegPath, args, { stdio: ["ignore", "pipe", "pipe"] });

        let errLog = "";
        proc.stderr.on("data", (chunk) => (errLog += chunk));
        proc.on("error", reject);
        proc.on("close", (code) => {
            if (code === 0) {
                console.log(`[ffmpeg:${label}] done`);
                resolve();
            } else {
                reject(new Error(`ffmpeg (${label}) exited ${code}:\n${errLog.slice(-1000)}`));
            }
        });
    });
}

// ─── Публичные функции ────────────────────────────────────────────

/**
 * Накладывает вотермарку на всё видео.
 */
export async function addWatermark(inputPath, outputPath) {
    const { width: w, height: h } = await getVideoSize(inputPath);
    const wmW = calcWatermarkWidth(w, h);

    console.log(`[ffmpeg:full] video: ${w}x${h}, wm: ${wmW}px`);

    await runFfmpeg([
        "-i", inputPath,
        "-i", WATERMARK_PATH,
        "-filter_complex",
            `[0:v]scale=${w}:${h},setsar=1[base];` +
            `[1:v]scale=${wmW}:-2[wm];` +
            `[base][wm]overlay=W-w-W*0.02:H-h-H*0.02[v]`,
        "-map", "[v]",
        "-map", "0:a?",
        "-codec:a", "copy",
        "-codec:v", "libx264",
        "-preset", "fast",
        "-crf", "23",
        "-pix_fmt", "yuv420p",
        "-y", outputPath,
    ], "full");

    return outputPath;
}

/**
 * Накладывает вотермарку и обрезает до durationSec секунд.
 */
export async function addWatermarkAndTrim(inputPath, outputPath, durationSec) {
    const { width: w, height: h } = await getVideoSize(inputPath);
    const wmW = calcWatermarkWidth(w, h);

    console.log(`[ffmpeg:short] video: ${w}x${h}, wm: ${wmW}px, trim: ${durationSec}s`);

    await runFfmpeg([
        "-i", inputPath,
        "-i", WATERMARK_PATH,
        "-filter_complex",
            `[0:v]scale=${w}:${h},setsar=1[base];` +
            `[1:v]scale=${wmW}:-2[wm];` +
            `[base][wm]overlay=W-w-W*0.02:H-h-H*0.02[v]`,
        "-map", "[v]",
        "-map", "0:a?",
        "-codec:a", "copy",
        "-codec:v", "libx264",
        "-preset", "fast",
        "-crf", "23",
        "-pix_fmt", "yuv420p",
        "-t", String(durationSec),
        "-y", outputPath,
    ], "short");

    return outputPath;
}

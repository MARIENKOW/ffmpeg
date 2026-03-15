const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SHORT_CHANNEL_ID = process.env.TELEGRAM_SHORT_CHANNEL_ID;
const FULL_CHANNEL_ID = process.env.TELEGRAM_FULL_CHANNEL_ID;

// ─── Описание видео — редактируйте здесь ─────────────────────────
const CAPTIONS = {
    short: `🔥 New exclusive content!\n\n
Full version available in VIP\n 👉 @tg_in_online_secret_bot`,

    full: ``,
};
// ─────────────────────────────────────────────────────────────────

const sendVideo = async (chatId, videoPath, caption) => {
    if (!BOT_TOKEN) throw new Error("TELEGRAM_BOT_TOKEN не задан в .env");
    if (!chatId) throw new Error("chat_id не задан");

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendVideo`;
    const form = new FormData();

    form.append("chat_id", chatId);
    form.append("caption", caption);
    form.append("parse_mode", "HTML");
    form.append("supports_streaming", "true");
    form.append("video", fs.createReadStream(videoPath), {
        filename: path.basename(videoPath),
        contentType: "video/mp4",
    });

    const response = await axios.post(url, form, {
        headers: form.getHeaders(),
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 10 * 60 * 1000, // 10 минут — для больших файлов
    });

    if (!response.data.ok) {
        throw new Error(`Telegram API error: ${JSON.stringify(response.data)}`);
    }

    return response.data;
};

/**
 * Отправляет короткое видео в SHORT_CHANNEL_ID
 */
const sendShortVideo = (videoPath) => {
    if (!SHORT_CHANNEL_ID)
        throw new Error("TELEGRAM_SHORT_CHANNEL_ID не задан в .env");
    return sendVideo(SHORT_CHANNEL_ID, videoPath, CAPTIONS.short);
};

/**
 * Отправляет полное видео в FULL_CHANNEL_ID
 */
const sendFullVideo = (videoPath) => {
    if (!FULL_CHANNEL_ID)
        throw new Error("TELEGRAM_FULL_CHANNEL_ID не задан в .env");
    return sendVideo(FULL_CHANNEL_ID, videoPath, CAPTIONS.full);
};

module.exports = { sendShortVideo, sendFullVideo };

// ─── Уведомление об ошибке администратору ────────────────────────
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

const sendErrorToAdmin = async (jobId, stage, error) => {
    if (!BOT_TOKEN) {
        console.warn(
            "[telegram] BOT_TOKEN не задан, уведомление не отправлено",
        );
        return;
    }
    if (!ADMIN_CHAT_ID) {
        console.warn(
            "[telegram] TELEGRAM_ADMIN_CHAT_ID не задан, уведомление не отправлено",
        );
        return;
    }

    const text = [
        `❌ <b>Ошибка обработки видео</b>`,
        ``,
        `🆔 <b>Job ID:</b> <code>${jobId}</code>`,
        `📍 <b>Этап:</b> ${stage}`,
        `💬 <b>Ошибка:</b>`,
        `<pre>${String(error).slice(0, 3000)}</pre>`,
    ].join("\n");

    try {
        await axios.post(
            `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
            {
                chat_id: ADMIN_CHAT_ID,
                text,
                parse_mode: "HTML",
            },
        );
    } catch (e) {
        console.error(
            "[telegram] Не удалось отправить уведомление администратору:",
            e.message,
        );
    }
};

module.exports = { sendShortVideo, sendFullVideo, sendErrorToAdmin };

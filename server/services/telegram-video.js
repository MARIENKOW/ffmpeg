import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";

const BOT_TOKEN        = process.env.TELEGRAM_BOT_TOKEN;
const SHORT_CHANNEL_ID = process.env.TELEGRAM_SHORT_CHANNEL_ID;
const FULL_CHANNEL_ID  = process.env.TELEGRAM_FULL_CHANNEL_ID;
const ADMIN_CHAT_ID    = process.env.TELEGRAM_ADMIN_CHAT_ID;

// ─── Подписи — редактируй здесь ──────────────────────────────────
const CAPTIONS = {
    short: `🔥 New exclusive content!\n\nFull version available in VIP\n👉 @tg_in_online_secret_bot`,
    full:  ``,
};

// ─── Базовая отправка видео ───────────────────────────────────────

async function sendVideo(chatId, videoPath, caption) {
    if (!BOT_TOKEN) throw new Error("TELEGRAM_BOT_TOKEN не задан в .env");
    if (!chatId)    throw new Error("chat_id не задан");

    const form = new FormData();
    form.append("chat_id",            chatId);
    form.append("caption",            caption);
    form.append("parse_mode",         "HTML");
    form.append("supports_streaming", "true");
    form.append("video", fs.createReadStream(videoPath), {
        filename:    path.basename(videoPath),
        contentType: "video/mp4",
    });

    const response = await axios.post(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendVideo`,
        form,
        {
            headers: form.getHeaders(),
            maxBodyLength:    Infinity,
            maxContentLength: Infinity,
            timeout: 10 * 60 * 1000, // 10 минут для больших файлов
        },
    );

    if (!response.data.ok) {
        throw new Error(`Telegram API error: ${JSON.stringify(response.data)}`);
    }

    return response.data;
}

// ─── Публичные функции ────────────────────────────────────────────

export function sendShortVideo(videoPath) {
    if (!SHORT_CHANNEL_ID)
        throw new Error("TELEGRAM_SHORT_CHANNEL_ID не задан в .env");
    return sendVideo(SHORT_CHANNEL_ID, videoPath, CAPTIONS.short);
}

export function sendFullVideo(videoPath) {
    if (!FULL_CHANNEL_ID)
        throw new Error("TELEGRAM_FULL_CHANNEL_ID не задан в .env");
    return sendVideo(FULL_CHANNEL_ID, videoPath, CAPTIONS.full);
}

// ─── Уведомление об ошибке администратору ────────────────────────

export async function sendErrorToAdmin(stage, error) {
    if (!BOT_TOKEN || !ADMIN_CHAT_ID) {
        console.warn("[telegram] BOT_TOKEN или ADMIN_CHAT_ID не заданы — уведомление пропущено");
        return;
    }

    const text = [
        `❌ <b>Ошибка планировщика</b>`,
        ``,
        `📍 <b>Этап:</b> ${stage}`,
        `💬 <b>Ошибка:</b>`,
        `<pre>${String(error).slice(0, 3000)}</pre>`,
    ].join("\n");

    try {
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id:    ADMIN_CHAT_ID,
            text,
            parse_mode: "HTML",
        });
    } catch (e) {
        console.error("[telegram] Не удалось уведомить администратора:", e.message);
    }
}

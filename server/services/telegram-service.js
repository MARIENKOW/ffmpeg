import { Bot } from "grammy";
import config from "../config.js";

const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = config;

// grammy: современная замена node-telegram-bot-api (без deprecated request)
const bot = new Bot(TELEGRAM_BOT_TOKEN);

class TelegramService {
    send = async (text) => {
        try {
            if (!text) return;
            await bot.api.sendMessage(TELEGRAM_CHAT_ID, text);
        } catch (error) {
            console.error("Telegram send error:", error);
            throw error;
        }
    };
}

export default new TelegramService();

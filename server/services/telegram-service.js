// import config from "../config";
import TelegramBot from "node-telegram-bot-api";
import config from "../config.js";

const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = config;

const telegrambot = new TelegramBot(TELEGRAM_BOT_TOKEN, {
   // polling: true,
});

class TelegramService {
   send = async (text) => {
      try {
         if (!text) return;

         await telegrambot.sendMessage(TELEGRAM_CHAT_ID, text);
         // telegrambot.on('message',(m)=>{
         //    console.log(m.text);
         //    console.log(m);
         //    telegrambot.sendMessage(
         //       TELEGRAM_CHAT_ID,
         //       m.text
         //    );
         // })
      } catch (error) {
         console.log(error);
         throw new Error(error);
         // throw error;
      }
   };
}

export default new TelegramService();

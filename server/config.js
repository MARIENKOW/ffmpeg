const config = {
    REMEMBER_TOKEN_MINUTES: 30,
    ACTIVATE_TOKEN_MINUTES: 30,
    ACCESS_TOKEN_MINUTES:   30,
    REFRESH_TOKEN_DAYS:     30,
    BLOG_COUNT:             10,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || "",
    TELEGRAM_CHAT_ID:   process.env.TELEGRAM_CHAT_ID   || "",
    CLIENT_URL: (process.env.CLIENT_URL || "http://localhost:3000").split(","),
};

export default config;

require("dotenv").config();

const express = require("express");
const path = require("path");
const fs = require("fs");

const prisma = require("./prisma");
const jobsRouter = require("./jobs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Создаём нужные папки при старте
const VIDEOS_DIR = path.resolve(process.env.VIDEOS_DIR || "./storage/videos");
const TMP_DIR = path.join(VIDEOS_DIR, "__tmp__");
[VIDEOS_DIR, TMP_DIR].forEach((dir) => fs.mkdirSync(dir, { recursive: true }));

// Роуты
app.use("/api/jobs", jobsRouter);

// Глобальный обработчик ошибок
app.use((err, _req, res, _next) => {
    console.error("[unhandled]", err);
    res.status(500).json({ error: "Internal server error" });
});

// Старт
(async () => {
    try {
        await prisma.$connect();
        console.log("[DB] Prisma подключён к PostgreSQL");

        app.listen(PORT, () => {
            console.log(`✅  Server: http://localhost:${PORT}`);
            console.log(`📂  Videos: ${VIDEOS_DIR}`);
        });
    } catch (err) {
        console.error("❌  Ошибка запуска:", err.message);
        process.exit(1);
    }
})();

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import http from "http";
import fileUpload from "express-fileupload";
import AdminRouter from "./routers/AdminRouter.js";
import VideoRouter from "./routers/VideoRouter.js";
import config from "./config.js";

// dotenv 17: dotenv.config() — API не изменился
dotenv.config();

const PORT = process.env.PORT;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(cookieParser());
app.use(cors({ credentials: true, origin: config.CLIENT_URL }));

app.use("/api" + process.env.VIDEO_FOLDER, express.static("./" + process.env.VIDEO_FOLDER));
app.use("/api" + process.env.NFT_FOLDER,   express.static("./" + process.env.NFT_FOLDER));
app.use("/api/meta",  express.static("./meta"));
app.use("/api/Admin", AdminRouter);
app.use("/api/Video", VideoRouter);

// Express 5: глобальный обработчик async-ошибок теперь встроен,
// но явный error handler всё равно полезен для единого формата ответа
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: err?.message || "Internal server error" });
});

const web = http.Server(app);

try {
    web.listen(PORT, process.env.SERVER_URL, () =>
        console.log(`Server is working on port ${PORT}`)
    );
} catch (e) {
    console.error(e.message);
}

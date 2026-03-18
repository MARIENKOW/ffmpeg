import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import cookieParser from "cookie-parser";
import http from "http";
import AdminRouter from "./routers/AdminRouter.js";
import fileUpload from "express-fileupload";
import VideoRouter from "./routers/VideoRouter.js";
import { Img } from "./models/Img.js";
import { Video } from "./models/Video.js";
import { Admin } from "./models/Admin.js";
import config from "./config.js";

const asModels = (models) => {
    Object.values(models).forEach((model) => {
        if (typeof model.associate === "function") {
            model.associate(models);
        }
    });
};

asModels({ Img, Video, Admin });

dotenv.config();

const PORT = process.env.PORT;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(cookieParser());
app.use(
    cors({
        credentials: true,
        origin: config.CLIENT_URL,
    }),
);

app.use(
    "/api" + process.env.VIDEO_FOLDER,
    express.static("./" + process.env.VIDEO_FOLDER),
);
app.use(
    "/api" + process.env.NFT_FOLDER,
    express.static("./" + process.env.NFT_FOLDER),
);
app.use("/api/meta", express.static("./meta"));
app.use("/api/Admin", AdminRouter);
app.use("/api/Video", VideoRouter);

const web = http.Server(app);

// process.on("warning", (warning) => {
//     if (warning.name === "DeprecationWarning") {
//         console.log("Deprecation warning stack:", warning.stack);
//     }
// });

try {
    web.listen(PORT, process.env.SERVER_URL, () =>
        console.log("Server is working"),
    );
} catch (e) {
    console.log(`${e.message}`);
}

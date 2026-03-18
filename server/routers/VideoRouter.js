import { Router } from "express";
import autAdminMiddelware from "../middlewares/authAdmin-middleware.js";
import videoController from "../controllers/video-controller.js";

const VideoRouter = new Router();

VideoRouter.post("/", autAdminMiddelware, videoController.create);

VideoRouter.delete("/:id", autAdminMiddelware, videoController.delete);
VideoRouter.delete("/", autAdminMiddelware, videoController.deleteAll);
VideoRouter.get("/", autAdminMiddelware, videoController.getAll);

export default VideoRouter;

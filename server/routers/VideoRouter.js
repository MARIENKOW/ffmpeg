import { Router } from "express";
import authAdminMiddleware from "../middlewares/authAdmin-middleware.js";
import videoController from "../controllers/video-controller.js";

// Express 5: Router() вместо new Router()
const VideoRouter = Router();

VideoRouter.post("/",    authAdminMiddleware, videoController.create);
VideoRouter.delete("/",  authAdminMiddleware, videoController.deleteAll);
VideoRouter.delete("/:id", authAdminMiddleware, videoController.delete);
VideoRouter.get("/",     authAdminMiddleware, videoController.getAll);

export default VideoRouter;

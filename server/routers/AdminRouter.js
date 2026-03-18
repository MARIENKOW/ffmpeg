import { Router } from "express";
import adminController from "../controllers/admin-controller.js";
import authAdminMiddleware from "../middlewares/authAdmin-middleware.js";

// Express 5: Router() вместо new Router()
const AdminRouter = Router();

AdminRouter.post("/signIn",                                           adminController.signIn);
AdminRouter.post("/logOut",                                           adminController.logOut);
AdminRouter.get( "/refresh",                                          adminController.refresh);
AdminRouter.get( "/aboutAdmin",          authAdminMiddleware,         adminController.aboutAdmin);
AdminRouter.post("/settings/change-password", authAdminMiddleware,    adminController.changePassSettings);
AdminRouter.post("/settings/change-name",     authAdminMiddleware,    adminController.changeName);

export default AdminRouter;

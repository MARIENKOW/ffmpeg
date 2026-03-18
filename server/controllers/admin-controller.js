import bcrypt from "bcrypt";
import token from "../services/token-service.js";
import { Admin } from "../models/Admin.js";

class Controller {
    signIn = async (req, res) => {
        try {
            const { password } = req.body;
            if (!password)
                return res
                    .status(400)
                    .json({ "root.server": "Incorrect values" });

            const adminData = await Admin.findOne({
                order: [["id", "DESC"]],
            });
            let adminId;
            if (!adminData) {
                const hashPassword = await bcrypt.hash(password, 5);

                const { id } = await Admin.create({ password: hashPassword });
                adminId = id;
            } else {
                const { id, password: dbPass } = adminData;
                adminId = id;
                const isPassEquals = await bcrypt.compare(password, dbPass);
                if (!isPassEquals)
                    return res
                        .status(400)
                        .json({ password: "Password is not correct" });
            }

            const tokens = token.generateTokens({ id: adminId, role: "admin" });
            await token.saveTokenAdmin(adminId, tokens.refreshToken);
            await res.cookie("refreshTokenAdmin", tokens.refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                // secure: true,   //mandatory
                // sameSite: 'none', // mandatory
                // path: "/"  // mandatory
            });
            await res.cookie("accessTokenAdmin", tokens.accessToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                // secure: true,   //mandatory
                // sameSite: 'none', // mandatory
                // path: "/"  // mandatory
            });
            const adminSendData = adminData?.dataValues || {};
            res.status(200).json({
                accessTokenAdmin: tokens.accessToken,
                ...adminSendData,
            });
        } catch (e) {
            console.log(e);
            res.status(500).json(e.message);
        }
    };

    logOut = async (req, res) => {
        try {
            const { refreshTokenAdmin } = req.cookies;
            res.clearCookie("refreshTokenAdmin");
            await token.removeTokenAdmin(refreshTokenAdmin);
            res.status(200).json(true);
        } catch (e) {
            res.status(500).json(e.message);
        }
    };

    refresh = async (req, res) => {
        try {
            const { refreshTokenAdmin } = req.cookies;
            if (!refreshTokenAdmin)
                return res.status(401).json("not authorized");

            const ansData = token.validateRefreshToken(refreshTokenAdmin);
            const adminData = await token.findTokenAdmin(refreshTokenAdmin);
            if (!ansData || !adminData)
                return res.status(401).json("not authorized");
            const tokens = token.generateTokens({
                id: adminData.id,
                role: "admin",
            });
            await token.saveTokenAdmin(adminData.id, tokens.refreshToken);
            await res.cookie("refreshTokenAdmin", tokens.refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                // secure: true,   //mandatory
                // sameSite: 'none', // mandatory
                // path: "/"  // mandatory
            });
            await res.cookie("accessTokenAdmin", tokens.accessToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                // secure: true,   //mandatory
                // sameSite: 'none', // mandatory
                // path: "/"  // mandatory
            });
            res.status(200).json(tokens.accessToken);
        } catch (e) {
            console.log(e);
            res.status(500).json(e.message);
        }
    };

    aboutAdmin = async (req, res) => {
        try {
            const { refreshTokenAdmin } = req.cookies;
            if (!refreshTokenAdmin)
                return res.status(401).json("not Authorization");
            const adminData = await token.findTokenAdmin(refreshTokenAdmin);
            const ansData = token.validateRefreshToken(refreshTokenAdmin);
            if (!ansData || !adminData)
                return res.status(401).json("not Authorization");
            return res.json(adminData);
        } catch (e) {
            res.status(500).json(e.message);
            console.log(e);
        }
    };
    changePassSettings = async (req, res, user_id) => {
        try {
            const { password, rePassword, currentPassword } = req.body;

            const adminData = await Admin.findOne({
                where: { id: req?.admin?.id },
            });

            if (!adminData)
                return res
                    .status(400)
                    .json({ "root.server": "User is not defined" });

            const dbPass = adminData.password;
            const isPassEquals = await bcrypt.compare(currentPassword, dbPass);

            if (!isPassEquals)
                return res
                    .status(400)
                    .json({ currentPassword: "Password is not correct" });

            if (password !== rePassword)
                return res
                    .status(400)
                    .json({ rePassword: "Re-entered password is not correct" });

            const hashPassword = await bcrypt.hash(password, 5);

            await Admin.update(
                { password: hashPassword },
                { where: { id: req?.admin?.id } }
            );

            res.json(true);
        } catch (e) {
            console.log(e);
            res.status(500).json(e.message);
        }
    };
    changeName = async (req, res) => {
        try {
            const { name } = req.body;

            if (!name)
                return res
                    .status(400)
                    .json({ "root.server": "Incorrect values" });

            await Admin.update({ name }, { where: { id: req?.admin?.id } });

            const adminData = await Admin.findOne({
                where: { id: req?.admin?.id },
            });

            res.status(200).json(adminData);
        } catch (e) {
            console.log(e);
            res.status(500).json(e?.message);
        }
    };
}
export default new Controller();

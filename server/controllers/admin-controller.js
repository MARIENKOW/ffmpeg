import bcrypt from "bcrypt";
import token from "../services/token-service.js";
import prisma from "../services/prisma.js";

const COOKIE_OPTIONS = {
    maxAge:   30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    // secure:   true,    // включить на проде
    // sameSite: "none",  // включить на проде
    // path:     "/",     // включить на проде
};

// Убираем чувствительные поля перед отправкой клиенту
function sanitize({ password, refreshToken, ...rest }) {
    return rest;
}

class Controller {
    signIn = async (req, res) => {
        try {
            const { password } = req.body;
            if (!password)
                return res.status(400).json({ "root.server": "Incorrect values" });

            const adminData = await prisma.admin.findFirst({
                orderBy: { id: "desc" },
            });

            let adminId;

            if (!adminData) {
                const hashPassword = await bcrypt.hash(password, 5);
                const created = await prisma.admin.create({
                    data: { password: hashPassword },
                });
                adminId = created.id;
            } else {
                const isPassEquals = await bcrypt.compare(password, adminData.password);
                if (!isPassEquals)
                    return res.status(400).json({ password: "Password is not correct" });
                adminId = adminData.id;
            }

            const tokens = token.generateTokens({ id: adminId, role: "admin" });
            await token.saveTokenAdmin(adminId, tokens.refreshToken);

            res.cookie("refreshTokenAdmin", tokens.refreshToken, COOKIE_OPTIONS);
            res.cookie("accessTokenAdmin",  tokens.accessToken,  COOKIE_OPTIONS);

            return res.status(200).json({
                accessTokenAdmin: tokens.accessToken,
                ...(adminData ? sanitize(adminData) : { id: adminId }),
            });
        } catch (e) {
            console.error(e);
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

            const payload   = token.validateRefreshToken(refreshTokenAdmin);
            const adminData = await token.findTokenAdmin(refreshTokenAdmin);
            if (!payload || !adminData)
                return res.status(401).json("not authorized");

            const tokens = token.generateTokens({ id: adminData.id, role: "admin" });
            await token.saveTokenAdmin(adminData.id, tokens.refreshToken);

            res.cookie("refreshTokenAdmin", tokens.refreshToken, COOKIE_OPTIONS);
            res.cookie("accessTokenAdmin",  tokens.accessToken,  COOKIE_OPTIONS);

            return res.status(200).json(tokens.accessToken);
        } catch (e) {
            console.error(e);
            res.status(500).json(e.message);
        }
    };

    aboutAdmin = async (req, res) => {
        try {
            const { refreshTokenAdmin } = req.cookies;
            if (!refreshTokenAdmin)
                return res.status(401).json("not Authorization");

            const adminData = await token.findTokenAdmin(refreshTokenAdmin);
            const payload   = token.validateRefreshToken(refreshTokenAdmin);
            if (!payload || !adminData)
                return res.status(401).json("not Authorization");

            return res.json(sanitize(adminData));
        } catch (e) {
            console.error(e);
            res.status(500).json(e.message);
        }
    };

    changePassSettings = async (req, res) => {
        try {
            const { password, rePassword, currentPassword } = req.body;

            const adminData = await prisma.admin.findUnique({
                where: { id: req.admin.id },
            });
            if (!adminData)
                return res.status(400).json({ "root.server": "User is not defined" });

            const isPassEquals = await bcrypt.compare(currentPassword, adminData.password);
            if (!isPassEquals)
                return res.status(400).json({ currentPassword: "Password is not correct" });

            if (password !== rePassword)
                return res.status(400).json({ rePassword: "Re-entered password is not correct" });

            const hashPassword = await bcrypt.hash(password, 5);
            await prisma.admin.update({
                where: { id: req.admin.id },
                data:  { password: hashPassword },
            });

            return res.json(true);
        } catch (e) {
            console.error(e);
            res.status(500).json(e.message);
        }
    };

    changeName = async (req, res) => {
        try {
            const { name } = req.body;
            if (!name)
                return res.status(400).json({ "root.server": "Incorrect values" });

            const updated = await prisma.admin.update({
                where: { id: req.admin.id },
                data:  { name },
            });

            return res.status(200).json(sanitize(updated));
        } catch (e) {
            console.error(e);
            res.status(500).json(e?.message);
        }
    };
}

export default new Controller();

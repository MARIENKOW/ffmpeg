import jwt from "jsonwebtoken";
import prisma from "./prisma.js";
import config from "../config.js";

class TokenService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
            expiresIn: config.ACCESS_TOKEN_MINUTES + "m",
        });
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
            expiresIn: config.REFRESH_TOKEN_DAYS + "d",
        });
        return { accessToken, refreshToken };
    }

    async saveTokenAdmin(adminId, refreshToken) {
        await prisma.admin.update({
            where: { id: Number(adminId) },
            data:  { refreshToken },
        });
    }

    async removeTokenAdmin(refreshToken) {
        await prisma.admin.updateMany({
            where: { refreshToken },
            data:  { refreshToken: null },
        });
    }

    async findTokenAdmin(refreshToken) {
        const admin = await prisma.admin.findFirst({
            where: { refreshToken },
        });
        return admin ?? null;
    }

    validateAccessToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        } catch {
            return null;
        }
    }

    validateRefreshToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        } catch {
            return null;
        }
    }
}

export default new TokenService();

// Prisma 7: клиент генерируется в ./generated/prisma
// Подключение передаётся через adapter, а не через DATABASE_URL в схеме
import { env } from "prisma/config";
import { PrismaClient } from "../generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

config();

console.log(process.env.DATABASE_URL);

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
    adapter,
    // log: ["query"], // раскомментировать для дебага
});

export default prisma;

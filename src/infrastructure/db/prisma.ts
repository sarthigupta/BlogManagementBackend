import { PrismaClient } from "../../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
dotenv.config();
const connectionString = process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/blog_management";

const adapter = new PrismaPg(connectionString);
const prisma = new PrismaClient({
    adapter
});

export default prisma;
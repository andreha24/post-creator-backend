import { PrismaClient } from "../generated/prisma/client";
import "dotenv/config";

const prisma = new PrismaClient();

export default prisma;

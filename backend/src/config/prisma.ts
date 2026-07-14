import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import {
  Prisma,
  PrismaClient,
} from "../generated/prisma/client.js";


const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

export type DbClient =
  PrismaClient | Prisma.TransactionClient;

export default prisma;

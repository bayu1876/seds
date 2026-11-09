import { authenticate } from "./auth/middleware/auth.middleware.js";
import prisma from "./config/prisma.js";
console.log(authenticate, prisma);

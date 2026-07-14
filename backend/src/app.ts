import express from "express";

import authRoutes from "./auth/routes/auth.routes.js";
import userRoutes from "./user/routes/user.routes.js";

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

export default app;

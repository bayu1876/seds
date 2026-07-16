import express from "express";

import authRoutes from "./auth/routes/auth.routes.js";
import userRoutes from "./user/routes/user.routes.js";
import departmentRoutes from "./department/routes/department.routes.js";
import roleRoutes from "./role/routes/role.routes.js";
import permissionRoutes from "./permission/routes/permission.routes.js";
import rolePermissionRoutes from "./role-permission/routes/role-permission.routes.js";

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api", rolePermissionRoutes);

export default app;

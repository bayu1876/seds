import express from "express";

import authRoutes from "./auth/routes/auth.routes.js";
import userRoutes from "./user/routes/user.routes.js";
import departmentRoutes from "./department/routes/department.routes.js";
import roleRoutes from "./role/routes/role.routes.js";
import permissionRoutes from "./permission/routes/permission.routes.js";
import rolePermissionRoutes from "./role-permission/routes/role-permission.routes.js";
import categoryRoutes from "./category/routes/category.routes.js";
import tagRoutes from "./tag/routes/tag.routes.js";
import confidentialLevelRoutes from "./confidential-level/routes/confidential-level.routes.js";
import documentRoutes from "./document/routes/document.routes.js";
import uploadRoutes from "./upload/routes/upload.routes.js";
import documentVersionRoutes from "./document-version/routes/document-version.routes.js";
import documentTagRoutes from "./document-tag/routes/document-tag.routes.js";
import documentRelationRoutes from "./document-relation/routes/document-relation.routes.js";

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api", rolePermissionRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/confidential-levels", confidentialLevelRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/document-versions", documentVersionRoutes);
app.use("/api/document-tags", documentTagRoutes);
app.use("/api/document-relations", documentRelationRoutes);

export default app;

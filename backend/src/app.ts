import express from "express";
import cors from "cors";

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
import favoriteRoutes from "./favorite/routes/favorite.routes.js";
import recentViewRoutes from "./recent-view/routes/recent-view.routes.js";
import auditLogRoutes from "./audit-log/routes/audit-log.routes.js";
import searchRoutes from "./search/routes/search.routes.js";
import dashboardRoutes from "./dashboard/dashboard.routes.js";
import publicLibraryRoutes from "./public-library/routes/public-library.routes.js";
import announcementRoutes from "./announcement/routes/announcement.routes.js";
const app = express();

app.use(express.json());

app.use(cors({
  origin: [
    "http://localhost:3002",
    "http://192.168.40.6:3002",
    "http://localhost:8080",
    "http://192.168.40.6:8080",
    "https://seds.sunansystem.com",
    "http://seds.sunansystem.com",
  ],
  credentials: true,
}));

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
app.use("/api/audit-log", auditLogRoutes);
app.use("/api/recent-view", recentViewRoutes);
app.use("/api/favorite", favoriteRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/public-library", publicLibraryRoutes);
app.use("/api/announcements", announcementRoutes);

export default app;

-- CreateTable
CREATE TABLE "department" (
    "id" UUID NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "color" VARCHAR(20),
    "icon" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_by" UUID,

    CONSTRAINT "department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role" (
    "id" UUID NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_by" UUID,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permission" (
    "id" UUID NOT NULL,
    "module" VARCHAR(50) NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_by" UUID,

    CONSTRAINT "permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permission" (
    "id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "role_permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL,
    "employee_number" VARCHAR(30),
    "username" VARCHAR(50) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(150),
    "phone" VARCHAR(30),
    "job_title" VARCHAR(100),
    "avatar" TEXT,
    "last_login_at" TIMESTAMP(3),
    "password_changed_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_by" UUID,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_role" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "user_role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_department" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "department_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "user_department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category" (
    "id" UUID NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "icon" VARCHAR(100),
    "color" VARCHAR(20),
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_system" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_by" UUID,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "color" VARCHAR(20),
    "description" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_by" UUID,

    CONSTRAINT "tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "confidential_level" (
    "id" UUID NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "color" VARCHAR(20),
    "icon" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_by" UUID,

    CONSTRAINT "confidential_level_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document" (
    "id" UUID NOT NULL,
    "document_number" VARCHAR(100),
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "department_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "confidential_level_id" UUID NOT NULL,
    "current_version_id" UUID,
    "effective_date" TIMESTAMP(3),
    "expired_date" TIMESTAMP(3),
    "search_vector" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_by" UUID,

    CONSTRAINT "document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_version" (
    "id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "version_number" INTEGER NOT NULL,
    "original_filename" VARCHAR(255) NOT NULL,
    "stored_filename" VARCHAR(255) NOT NULL,
    "storage_path" TEXT NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "file_size" BIGINT NOT NULL,
    "thumbnail_path" TEXT,
    "preview_status" VARCHAR(30) NOT NULL,
    "version_notes" TEXT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploaded_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_by" UUID,

    CONSTRAINT "document_version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_tag" (
    "id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "document_tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_relation" (
    "id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "related_document_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "document_relation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorite" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recent_view" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recent_view_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "document_id" UUID,
    "action" VARCHAR(50) NOT NULL,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "department_code_key" ON "department"("code");

-- CreateIndex
CREATE INDEX "idx_department_name" ON "department"("name");

-- CreateIndex
CREATE INDEX "idx_department_code" ON "department"("code");

-- CreateIndex
CREATE INDEX "idx_department_active" ON "department"("is_active");

-- CreateIndex
CREATE INDEX "idx_department_deleted" ON "department"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "role_code_key" ON "role"("code");

-- CreateIndex
CREATE INDEX "idx_role_code" ON "role"("code");

-- CreateIndex
CREATE INDEX "idx_role_name" ON "role"("name");

-- CreateIndex
CREATE INDEX "idx_role_active" ON "role"("is_active");

-- CreateIndex
CREATE INDEX "idx_role_deleted" ON "role"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "permission_module_action_key" ON "permission"("module", "action");

-- CreateIndex
CREATE UNIQUE INDEX "role_permission_role_id_permission_id_key" ON "role_permission"("role_id", "permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_role_user_id_role_id_key" ON "user_role"("user_id", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_department_user_id_department_id_key" ON "user_department"("user_id", "department_id");

-- CreateIndex
CREATE UNIQUE INDEX "category_code_key" ON "category"("code");

-- CreateIndex
CREATE UNIQUE INDEX "tag_name_key" ON "tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "confidential_level_code_key" ON "confidential_level"("code");

-- CreateIndex
CREATE UNIQUE INDEX "document_tag_document_id_tag_id_key" ON "document_tag"("document_id", "tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "document_relation_document_id_related_document_id_key" ON "document_relation"("document_id", "related_document_id");

-- CreateIndex
CREATE UNIQUE INDEX "favorite_user_id_document_id_key" ON "favorite"("user_id", "document_id");

-- CreateIndex
CREATE UNIQUE INDEX "recent_view_user_id_document_id_key" ON "recent_view"("user_id", "document_id");

-- AddForeignKey
ALTER TABLE "department" ADD CONSTRAINT "department_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department" ADD CONSTRAINT "department_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department" ADD CONSTRAINT "department_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role" ADD CONSTRAINT "role_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role" ADD CONSTRAINT "role_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role" ADD CONSTRAINT "role_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission" ADD CONSTRAINT "permission_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission" ADD CONSTRAINT "permission_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission" ADD CONSTRAINT "permission_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_department" ADD CONSTRAINT "user_department_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_department" ADD CONSTRAINT "user_department_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_department" ADD CONSTRAINT "user_department_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag" ADD CONSTRAINT "tag_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag" ADD CONSTRAINT "tag_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag" ADD CONSTRAINT "tag_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "confidential_level" ADD CONSTRAINT "confidential_level_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "confidential_level" ADD CONSTRAINT "confidential_level_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "confidential_level" ADD CONSTRAINT "confidential_level_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_confidential_level_id_fkey" FOREIGN KEY ("confidential_level_id") REFERENCES "confidential_level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_current_version_id_fkey" FOREIGN KEY ("current_version_id") REFERENCES "document_version"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_version" ADD CONSTRAINT "document_version_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_version" ADD CONSTRAINT "document_version_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_version" ADD CONSTRAINT "document_version_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_version" ADD CONSTRAINT "document_version_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_version" ADD CONSTRAINT "document_version_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_tag" ADD CONSTRAINT "document_tag_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_tag" ADD CONSTRAINT "document_tag_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_tag" ADD CONSTRAINT "document_tag_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_relation" ADD CONSTRAINT "document_relation_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_relation" ADD CONSTRAINT "document_relation_related_document_id_fkey" FOREIGN KEY ("related_document_id") REFERENCES "document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_relation" ADD CONSTRAINT "document_relation_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite" ADD CONSTRAINT "favorite_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite" ADD CONSTRAINT "favorite_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recent_view" ADD CONSTRAINT "recent_view_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recent_view" ADD CONSTRAINT "recent_view_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

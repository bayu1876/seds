import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import prisma from "../../config/prisma.js";
import { Prisma } from "../../generated/prisma/client.js";
import { DocumentVersionRepository } from "../repositories/document-version.repository.js";

interface UploadVersionDto {
  documentId: string;
  uploadedBy: string;
  tempPath: string;
  originalFilename: string;
  storedFilename: string;
  mimeType: string;
  fileSize: number;
  versionNotes?: string | null;
}

const MAX_VERSION_ATTEMPTS = 3;

export class DocumentVersionService {
  private repository =
    new DocumentVersionRepository();

  private async deleteFile(
    filePath: string,
  ) {
    await fs.promises
      .unlink(filePath)
      .catch(() => undefined);
  }

  async setCurrent(versionId: string) {
    const version =
      await this.repository.findForSetCurrent(
        versionId,
      );

    if (
      !version ||
      version.document.deleted_at
    ) {
      throw new Error(
        "Document version not found",
      );
    }

    if (
      version.document.current_version_id !==
      version.id
    ) {
      await this.repository.updateCurrentVersion(
        version.document_id,
        version.id,
      );
    }

    const { document, ...versionData } =
      version;

    void document;

    return {
      ...versionData,
      is_current: true,
    };
  }

  async download(versionId: string) {
    const version =
      await this.repository.findForDownload(
        versionId,
      );

    if (
      !version ||
      version.document.deleted_at
    ) {
      throw new Error(
        "Document version not found",
      );
    }

    const storageRoot =
      path.resolve("/srv/seds/storage");

    const filePath = path.resolve(
      storageRoot,
      version.storage_path,
    );

    if (
      !filePath.startsWith(
        `${storageRoot}${path.sep}`,
      )
    ) {
      throw new Error("File not found");
    }

    try {
      await fs.promises.access(
        filePath,
        fs.constants.R_OK,
      );
    } catch {
      throw new Error("File not found");
    }

    return {
      filePath,
      fileName: version.original_filename,
      mimeType: version.mime_type,
    };
  }

  async findHistory(
    documentId: string,
  ) {
    const document =
      await this.repository.findDocumentById(
        documentId,
      );

    if (!document) {
      throw new Error(
        "Document not found",
      );
    }

    const versions =
      await this.repository.findByDocumentId(
        documentId,
      );

    return versions.map((version) => ({
      ...version,
      is_current:
        version.id ===
        document.current_version_id,
    }));
  }

  async upload(
    data: UploadVersionDto,
  ) {
    const {
      documentId,
      uploadedBy,
      tempPath,
      originalFilename,
      storedFilename,
      mimeType,
      fileSize,
      versionNotes,
    } = data;

    let destinationPath:
      | string
      | null = null;
    let fileMoved = false;

    try {
      const document =
        await this.repository.findDocumentById(
          documentId,
        );

      if (!document) {
        throw new Error(
          "Document not found",
        );
      }

      const checksum =
        await new Promise<string>(
          (
            resolve,
            reject,
          ) => {
            const hash =
              crypto.createHash(
                "sha256",
              );

            const stream =
              fs.createReadStream(
                tempPath,
              );

            stream.on(
              "data",
              (chunk: Buffer) =>
                hash.update(chunk),
            );

            stream.on(
              "end",
              () =>
                resolve(
                  hash.digest("hex"),
                ),
            );

            stream.on(
              "error",
              reject,
            );
          },
        );

      void checksum;

      const documentDirectory =
        path.join(
          "/srv/seds/storage/documents",
          documentId.substring(
            0,
            2,
          ),
          documentId,
        );

      const originalDirectory =
        path.join(
          documentDirectory,
          "original",
        );

      await fs.promises.mkdir(
        originalDirectory,
        {
          recursive: true,
        },
      );

      destinationPath =
        path.join(
          originalDirectory,
          storedFilename,
        );

      await fs.promises.rename(
        tempPath,
        destinationPath,
      );

      fileMoved = true;

      const storagePath =
        path.relative(
          "/srv/seds/storage",
          destinationPath,
        );

      for (
        let attempt = 1;
        attempt <=
        MAX_VERSION_ATTEMPTS;
        attempt++
      ) {
        const latestVersion =
          await this.repository.findLatestVersion(
            documentId,
          );

        const nextVersion =
          latestVersion
            ? latestVersion.version_number +
              1
            : 1;

        try {
          return await prisma.$transaction(
            async (tx) => {
              const repository =
                new DocumentVersionRepository(
                  tx,
                );

              const documentVersion =
                await repository.create({
                  document_id:
                    documentId,
                  version_number:
                    nextVersion,
                  original_filename:
                    originalFilename,
                  stored_filename:
                    storedFilename,
                  storage_path:
                    storagePath,
                  mime_type:
                    mimeType,
                  file_size:
                    fileSize,
                  thumbnail_path:
                    null,
                  preview_status:
                    "PENDING",
                  version_notes:
                    versionNotes?.trim() ||
                    null,
                  uploaded_by:
                    uploadedBy,
                  created_by:
                    uploadedBy,
                });

              await repository.updateCurrentVersion(
                documentId,
                documentVersion.id,
              );

              return documentVersion;
            },
          );
        } catch (error) {
          const isVersionConflict =
            error instanceof
              Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002";

          if (
            !isVersionConflict ||
            attempt ===
              MAX_VERSION_ATTEMPTS
          ) {
            if (isVersionConflict) {
              throw new Error(
                "Version conflict, please retry",
              );
            }

            throw error;
          }
        }
      }

      throw new Error(
        "Version conflict, please retry",
      );
    } catch (error) {
      if (
        destinationPath &&
        fileMoved
      ) {
        await this.deleteFile(
          destinationPath,
        );
      }

      await this.deleteFile(tempPath);

      throw error;
    }
  }
}

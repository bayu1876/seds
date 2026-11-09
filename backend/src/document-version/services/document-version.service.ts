import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import prisma from "../../config/prisma.js";
import { DocumentVersionRepository } from "../repositories/document-version.repository.js";

interface UploadFirstVersionDto {
  documentId: string;
  uploadedBy: string;
  tempPath: string;
  originalFilename: string;
  storedFilename: string;
  mimeType: string;
  fileSize: number;
}

export class DocumentVersionService {
  private repository =
    new DocumentVersionRepository();

  async upload(
    data: UploadFirstVersionDto,
  ) {
    const {
      documentId,
      uploadedBy,
      tempPath,
      originalFilename,
      storedFilename,
      mimeType,
      fileSize,
    } = data;


    const document =
      await this.repository.findDocumentById(
        documentId,
      );

    if (!document) {
      throw new Error(
        "Document not found",
      );
    }

    const latestVersion =
      await this.repository.findLatestVersion(
        documentId,
      );

    const nextVersion =
      latestVersion
        ? latestVersion.version_number + 1
        : 1;


    void uploadedBy;
    void originalFilename;
    void storedFilename;
    void mimeType;
    void fileSize;

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
	    (
 	      chunk: Buffer,
	     ) =>
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

    const destinationPath =
      path.join(
        originalDirectory,
        storedFilename,
      );

    await fs.promises.rename(
      tempPath,
      destinationPath,
    );

   const storagePath =
     path.relative(
       "/srv/seds/storage",
       destinationPath,
     );

    await fs.promises.mkdir(
      originalDirectory,
      {
        recursive: true,
      },
    );

    return prisma.$transaction(
      async (tx) => {
        const repository =
          new DocumentVersionRepository(
            tx,
          );

        const documentVersion =
          await repository.create({
            document_id: documentId,
            version_number: nextVersion,
            original_filename:
              originalFilename,
            stored_filename:
              storedFilename,
            storage_path: storagePath,
            mime_type: mimeType,
            file_size: fileSize,
            thumbnail_path: null,
            preview_status:
              "PENDING",
            version_notes: null,
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
   }
}

import fs from "node:fs";
import path from "node:path";

import multer from "multer";

const tempDirectory = path.resolve(
  "/srv/seds/storage/temp",
);

if (!fs.existsSync(tempDirectory)) {
  fs.mkdirSync(tempDirectory, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: (
    _req,
    _file,
    callback,
  ) => {
    callback(
      null,
      tempDirectory,
    );
  },

  filename: (
    _req,
    file,
    callback,
  ) => {
    const sanitizeFilename = (originalName: string) => {
      const safeName = originalName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9. _-]/g, "_")
        .replace(/\s+/g, "_")
        .replace(/_+/g, "_");
      const ext = safeName.slice(safeName.lastIndexOf("."));
      const nameWithoutExt = safeName.slice(0, safeName.lastIndexOf("."));
      const safeNamePart = nameWithoutExt.replace(/\s/g, "_");
      return `${Date.now()}-${safeNamePart}${ext}`;
    };

    const filename =
      sanitizeFilename(file.originalname);

    callback(
      null,
      filename,
    );
  },
});

export const upload =
  multer({
    storage,
    limits: {
      fileSize:
        1 * 1024 * 1024 * 1024,
    },
  });

export const cleanupTempFiles = () => {
  const files = fs.readdirSync(tempDirectory);

  for (const file of files) {
    const filePath = path.join(tempDirectory, file);
    fs.unlinkSync(filePath);
  }
};

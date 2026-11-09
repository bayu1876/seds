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
    const filename =
      `${Date.now()}-${file.originalname}`;

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
        100 * 1024 * 1024,
    },
  });

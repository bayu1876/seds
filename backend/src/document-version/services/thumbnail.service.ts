import { execFile } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { DocumentVersionRepository } from "../repositories/document-version.repository.js";

const execFileAsync = promisify(execFile);
const STORAGE_ROOT = "/srv/seds/storage";

export class ThumbnailService {
  private repository = new DocumentVersionRepository();

  private async commandExists(cmd: string): Promise<boolean> {
    try {
      await execFileAsync("which", [cmd]);
      return true;
    } catch {
      return false;
    }
  }

  private resolveStoragePath(relativePath: string): string {
    const full = path.resolve(STORAGE_ROOT, relativePath);
    if (!full.startsWith(`${STORAGE_ROOT}${path.sep}`)) {
      throw new Error("Invalid storage path");
    }
    return full;
  }

  async generateForVersion(versionId: string): Promise<void> {
    const version = await this.repository.findById(versionId);
    if (!version) return;

    const sourcePath = this.resolveStoragePath(version.storage_path);
    const thumbRelative = path.join("thumbnails", `${version.id}.jpg`);
    const thumbPath = path.resolve(STORAGE_ROOT, thumbRelative);

    await fs.promises.mkdir(path.dirname(thumbPath), { recursive: true });

    try {
      await fs.promises.access(sourcePath, fs.constants.R_OK);
    } catch {
      await this.repository.updateThumbnail(versionId, { thumbnail_path: null, preview_status: "FAILED" });
      return;
    }

    const mime = (version.mime_type || "").toLowerCase();
    let ok = false;

    try {
      if (mime.startsWith("video/")) {
        ok = await this.generateVideoThumbnail(sourcePath, thumbPath);
      } else if (mime === "application/pdf" || version.original_filename.toLowerCase().endsWith(".pdf")) {
        ok = await this.generatePdfThumbnail(sourcePath, thumbPath);
      } else if (mime.startsWith("image/")) {
        ok = await this.generateImageThumbnail(sourcePath, thumbPath);
      } else {
        ok = false;
      }
    } catch {
      ok = false;
    }

    if (ok) {
      await this.repository.updateThumbnail(versionId, { thumbnail_path: thumbRelative, preview_status: "READY" });
    } else {
      await fs.promises.unlink(thumbPath).catch(() => undefined);
      await this.repository.updateThumbnail(versionId, { thumbnail_path: null, preview_status: "FAILED" });
    }
  }

  private async generateVideoThumbnail(source: string, dest: string): Promise<boolean> {
    if (!(await this.commandExists("ffmpeg"))) return false;
    // try frame at 2s first
    const attempts: string[][] = [
      ["-y", "-ss", "00:00:02", "-i", source, "-frames:v", "1", "-q:v", "3", dest],
      ["-y", "-ss", "00:00:00", "-i", source, "-frames:v", "1", "-q:v", "3", dest],
    ];
    for (const args of attempts) {
      try {
        await execFileAsync("ffmpeg", args, { timeout: 30000 });
        await fs.promises.access(dest, fs.constants.R_OK);
        return true;
      } catch {
        await fs.promises.unlink(dest).catch(() => undefined);
      }
    }
    return false;
  }

  private async generatePdfThumbnail(source: string, dest: string): Promise<boolean> {
    // try pdftoppm
    if (await this.commandExists("pdftoppm")) {
      const outBase = dest.replace(/\.jpg$/i, "");
      try {
        await execFileAsync("pdftoppm", ["-f", "1", "-l", "1", "-jpeg", "-singlefile", source, outBase], { timeout: 30000 });
        await fs.promises.access(dest, fs.constants.R_OK);
        return true;
      } catch {
        await fs.promises.unlink(dest).catch(() => undefined);
      }
    }
    // try mutool
    if (await this.commandExists("mutool")) {
      try {
        await execFileAsync("mutool", ["draw", "-o", dest, source, "1"], { timeout: 30000 });
        await fs.promises.access(dest, fs.constants.R_OK);
        return true;
      } catch {
        await fs.promises.unlink(dest).catch(() => undefined);
      }
    }
    return false;
  }

  private async generateImageThumbnail(source: string, dest: string): Promise<boolean> {
    // if tools available we could resize; fallback to copy original as thumbnail
    try {
      await fs.promises.copyFile(source, dest);
      return true;
    } catch {
      return false;
    }
  }
}

import type {
  Request,
  Response,
} from "express";

export class UploadController {
  async test(
    req: Request,
    res: Response,
  ) {
    return res.json({
      success: true,
      message:
        "File uploaded successfully",
      data: req.file,
    });
  }
}

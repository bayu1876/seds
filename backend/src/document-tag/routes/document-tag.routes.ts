import { Router } from "express";
import type { Request, Response } from "express";

const router = Router();

export default router;

router.get("/", (_req, res) => {
  return res.json({
    success: true,
    message: "Document Tag API",
  });
});

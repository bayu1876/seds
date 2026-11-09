import type { Request, Response } from "express";

import { AuditLogService } from "../services/audit-log.service.js";

type LogActionBody = {
  document_id?: string;
  action: string;
  ip_address?: string;
  user_agent?: string;
  description?: string;
};

type LogActionRequest = Request & {
  user: {
    id: string;
  };
};

export class AuditLogController {
  private service =
    new AuditLogService();

  async logAction(
    req: Request,
    res: Response,
  ) {
    try {
      const user = (req as LogActionRequest).user;

      await this.service.logAction({
        user_id: user.id,
        document_id: req.body.document_id ?? null,
        action: req.body.action,
        ip_address: req.body.ip_address ?? req.ip,
        user_agent: req.body.user_agent ?? req.get("User-Agent"),
        description: req.body.description ?? null,
      });

      return res.status(201).json({
        success: true,
        message: "Action logged successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Internal Server Error",
      });
    }
  }

  async getUserActions(
    req: Request,
    res: Response,
  ) {
    try {
      const user = (req as LogActionRequest).user;

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 50;

      const result =
        await this.service.getUserActions(user.id, page as number, limit as number);

      return res.status(200).json({
        success: true,
        message: "Audit logs retrieved successfully",
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Internal Server Error",
      });
    }
  }

  async getDocumentActions(
    req: Request,
    res: Response,
  ) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 50;

      const result =
        await this.service.getDocumentActions(
          req.params.documentId as string,
          page as number,
          limit as number,
        );

      return res.status(200).json({
        success: true,
        message: "Document audit logs retrieved successfully",
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Internal Server Error",
      });
    }
  }
}
// src/middlewares/notFound.middleware.ts
import { Request, Response } from "express";

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    message: `Cannot ${req.method} ${req.url}`,
  });
};

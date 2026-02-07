import type { NextFunction, Request, Response } from "express";
import * as z from "zod";
import AppError from "../utils/AppError";

// MongoDB duplicate key error typing
interface MongoError extends Error {
  code: number;
  keyPattern?: Record<string, unknown>;
}

const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  // Logging
  console.error("Error caught by errorHandler middleware:", err);

  // --- Zod Validation Error ---
  if (err instanceof z.ZodError) {
    return res.status(400).json({
      status: "fail",
      errors: err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  // --- MongoDB Duplicate Key Error ---
  const mongoErr = err as MongoError;
  if (mongoErr.code === 11000 && mongoErr.keyPattern) {
    const path = Object.keys(mongoErr.keyPattern)[0];
    return res.status(400).json({
      status: "fail",
      error: {
        path,
        message: `${path} already exists`,
      },
    });
  }

  // --- Custom AppError ---
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "fail",
      error: {
        message: err.message,
      },
    });
  }

  // --- Generic Error Fallback ---
  if (err instanceof Error) {
    return res.status(500).json({
      status: "error",
      error: {
        message: err.message || "Internal server error",
      },
    });
  }

  // --- Unknown error fallback ---
  return res.status(500).json({
    status: "error",
    error: {
      message: "Unknown error occurred",
    },
  });
};

export default errorHandler;

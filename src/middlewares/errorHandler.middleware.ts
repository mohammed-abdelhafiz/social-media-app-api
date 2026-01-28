import type { NextFunction, Request, Response } from "express";
import * as z from "zod";
import AppError from "../utils/AppError";

type ErrorWithCode = Error & { code: number };
type ErrorWithKeyPattern = Error & { keyPattern: object };

const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  console.log("Error caught by errorHandler middleware:", err);
  if (err instanceof z.ZodError) {
    res.status(400).json({
      status: "fail",
      error: {
        path: err.issues[0].path[0],
        message: err.issues[0].message,
      },
    });
  } else if (err instanceof Error && (err as ErrorWithCode).code === 11000) {
    const path = Object.keys((err as ErrorWithKeyPattern).keyPattern)[0];
    res.status(400).json({
      status: "fail",
      error: {
        message: `${path} already exists`,
      },
    });
  } else if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: "fail",
      error: {
        message: err.message,
      },
    });
  } else if (err instanceof Error) {
    res.status(500).json({
      status: "error",
      error: {
        message: err.message || "Internal server error",
      },
    });
  }
};

export default errorHandler;

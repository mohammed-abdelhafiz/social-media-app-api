import { Request } from "express";
import AppError from "../utils/AppError";

const notFoundHandler = (req: Request) => {
  throw new AppError(`Route ${req.originalUrl} not found`, 404);
};

export default notFoundHandler;
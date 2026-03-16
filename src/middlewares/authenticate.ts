import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/token";
import AppError from "../utils/AppError";

const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const token = req.cookies.accessToken;
  const jwtPayload = verifyAccessToken(token);
  if (!jwtPayload) {
    throw new AppError("Invalid or expired token", 401);
  }
  req.JwtPayload = jwtPayload;
  next();
};

export default authenticate;

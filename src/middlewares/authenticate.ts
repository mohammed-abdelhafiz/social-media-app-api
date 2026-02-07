import { NextFunction, Request, Response } from "express";
import { extractToken, verifyAccessToken } from "../utils/token";
import AppError from "../utils/AppError";
import User from "../models/User.model";

const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = extractToken(req);
  const decoded = verifyAccessToken(token);
  const user = await User.findById(decoded.userId);
  if (!user || decoded.tokenVersion !== user.tokenVersion) {
    throw new AppError("Invalid access token", 401);
  }
  req.JwtPayload = decoded;
  next();
};

export default authenticate;

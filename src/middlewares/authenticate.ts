import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/token";
import AppError from "../utils/AppError";
import { JwtPayload } from "../utils/types";
import User from "../models/User.model";

const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.headers.authorization?.split(" ")[1];
  if (!accessToken) {
    throw new AppError("No token provided", 401);
  }
  const decodedToken = verifyAccessToken(accessToken) as JwtPayload;
  const user = await User.findById(decodedToken.userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (decodedToken.tokenVersion !== user.tokenVersion) {
    throw new AppError("Invalid access token", 401);
  }

  //@ts-ignore
  req.user = user;
  next();
};

export default authenticate;

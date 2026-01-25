import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/token";
import AppError from "../utils/AppError";

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.headers.authorization?.split(" ")[1];
  if (!accessToken) {
    throw new AppError("No token provided", 401, "token");
  }
  const decodedToken = verifyAccessToken(accessToken);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (req as any).user = decodedToken;
  next();
};

export default authenticate;

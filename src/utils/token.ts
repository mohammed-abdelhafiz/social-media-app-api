import jwt from "jsonwebtoken";
import type { JwtPayload } from "./types";
import AppError from "./AppError";

// Access token
export const generateAccessToken = (payload: JwtPayload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: "15m", //15 minutes
  });
};

export const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JwtPayload;
  } catch {
    throw new AppError("Invalid or expired access token", 401);
  }
};

// Refresh token
export const generateRefreshToken = (payload: JwtPayload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: "7d", //7 days
  });
};

export const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as JwtPayload;
  } catch {
    throw new AppError(
      "Invalid or expired refresh token, please login again",
      401
    );
  }
};

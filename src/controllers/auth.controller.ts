import type { Request, Response } from "express";
import { loginSchema, registerSchema } from "../schemas/auth.schema";
import authService from "../services/auth.service";
import AppError from "../utils/AppError";
import { verifyRefreshToken } from "../utils/token";

const register = async (req: Request, res: Response) => {
  const parsedBody = registerSchema.parse(req.body);
  const result = await authService.register(parsedBody);
  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
  });
  res.status(201).json({
    message: "User registered successfully",
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
};

const login = async (req: Request, res: Response) => {
  const parsedBody = loginSchema.parse(req.body);
  const result = await authService.login(parsedBody);
  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
  });
  res.status(200).json({
    message: "User logged in successfully",
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie("refreshToken");
  // @ts-ignore
  const user = req.user;
  await authService.logout(user.id);
  res.status(200).json({
    message: "User logged out successfully",
  });
};

const refreshAccessToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    throw new AppError("No refresh token provided", 401);
  }
  const decodedToken = verifyRefreshToken(refreshToken);
  const { newAccessToken, newRefreshToken } =
    await authService.refreshAccessToken(decodedToken);
  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
  });
  res.status(200).json({
    message: "Token refreshed successfully",
    data: {
      accessToken: newAccessToken,
    },
  });
};

export default {
  register,
  login,
  logout,
  refreshAccessToken,
};

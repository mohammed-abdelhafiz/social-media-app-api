import type { Request, Response } from "express";
import { loginSchema, registerSchema, requestResetPasswordSchema, resetPasswordSchema } from "../schemas/auth.schema";
import authService from "../services/auth.service";
import AppError from "../utils/AppError";
import { SetRefreshTokenCookie, verifyRefreshToken } from "../utils/token";

const register = async (req: Request, res: Response) => {
  const parsedBody = registerSchema.parse(req.body);
  const result = await authService.register(parsedBody);
  SetRefreshTokenCookie(res, result.refreshToken);
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
  SetRefreshTokenCookie(res, result.refreshToken);
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
  const userId = req.JwtPayload.userId;
  await authService.logout(userId);
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
  SetRefreshTokenCookie(res, newRefreshToken);
  res.status(200).json({
    message: "Token refreshed successfully",
    data: {
      accessToken: newAccessToken,
    },
  });
};

const requestResetPassword = async (req: Request, res: Response) => {
  const parsedBody = requestResetPasswordSchema.parse(req.body);
  const { message } = await authService.requestResetPassword(parsedBody.email);
  res.status(200).json({
    message,
  });
};

const resetPassword = async (req: Request, res: Response) => {
  const token = req.params.token as string;
  const parsedBody = resetPasswordSchema.parse(req.body);
  const { message } = await authService.resetPassword(token, parsedBody.newPassword);
  res.status(200).json({
    message,
  });
};

export default {
  register,
  login,
  logout,
  refreshAccessToken,
  requestResetPassword,
  resetPassword,
};

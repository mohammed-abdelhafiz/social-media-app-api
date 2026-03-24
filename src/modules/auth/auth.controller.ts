import type { Request, Response } from "express";
import * as authService from "./auth.service";
import { setTokensInCookies } from "../../shared/utils/jwt";
import {
  forgotPasswordDto,
  loginDto,
  registerDto,
  resetPasswordDto,
} from "./auth.dto";

/**
 * @route POST /api/auth/register
 * @desc create a new account
 * @access Public
 */
export const register = async (req: Request, res: Response) => {
  const parsedBody = registerDto.parse(req.body);
  const result = await authService.register(parsedBody);
  setTokensInCookies(res, result.accessToken, result.refreshToken);
  res.status(201).json({
    message: "Registered successfully",
    user: result.user,
  });
};

/**
 * @route POST /api/auth/login
 * @desc login to your account
 * @access Public
 */
export const login = async (req: Request, res: Response) => {
  const parsedBody = loginDto.parse(req.body);
  const result = await authService.login(parsedBody);
  setTokensInCookies(res, result.accessToken, result.refreshToken);
  res.status(200).json({
    message: "Logged in successfully",
    user: result.user,
  });
};

/**
 * @route POST /api/auth/logout
 * @desc Logout
 * @access Private (requires authentication)
 */
export const logout = async (req: Request, res: Response) => {
  res.clearCookie("refreshToken");
  res.clearCookie("accessToken");
  res.status(200).json({
    message: "Logged out successfully",
  });
};

/**
 * @route POST /api/auth/refresh
 * @desc Refresh access token using refresh token
 * @access Public (but requires refresh token cookie)
 */
export const refreshAccessToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  const { newAccessToken, newRefreshToken } =
    await authService.refreshAccessToken(refreshToken);
  setTokensInCookies(res, newAccessToken, newRefreshToken);
  res.status(200).json({
    message: "Access token refreshed successfully",
  });
};

/**
 * @route POST /api/auth/forgot-password
 * @desc forgot password (send reset password email)
 * @access Public
 */
export const forgotPassword = async (req: Request, res: Response) => {
  const parsedBody = forgotPasswordDto.parse(req.body);
  await authService.forgotPassword(parsedBody);
  res.status(200).json({
    message: "If an account exists, a reset email has been sent",
  });
};

/**
 * @route POST /api/auth/reset-password/:token
 * @desc Reset password
 * @access Public
 */
export const resetPassword = async (req: Request, res: Response) => {
  const token = req.params.token as string;
  const parsedBody = resetPasswordDto.parse(req.body);
  await authService.resetPassword(token, parsedBody);
  res.status(200).json({
    message: "Password reset successfully",
  });
};

/**
 * @route GET /api/auth/me
 * @desc Get me
 * @access Private (requires authentication)
 */
export const getMe = async (req: Request, res: Response) => {
  const myId = req.JwtPayload?.userId;
  if (!myId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const me = await authService.getMe(myId);
  res.status(200).json(me);
};

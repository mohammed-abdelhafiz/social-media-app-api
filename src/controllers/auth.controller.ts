import type { Request, Response } from "express";
import {
  loginSchema,
  registerSchema,
  requestResetPasswordSchema,
  resetPasswordSchema,
} from "../schemas/auth.schema";
import authService from "../services/auth.service";
import {
  setAccessTokenCookie,
  setRefreshTokenCookie,
  verifyRefreshToken,
} from "../utils/token";

const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
) => {
  res.clearCookie("refreshToken");
  setRefreshTokenCookie(res, refreshToken);
  setAccessTokenCookie(res, accessToken);
};



/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
const register = async (req: Request, res: Response) => {
  const parsedBody = registerSchema.parse(req.body);
  let avatar;
  if (req.file) {
    avatar = {
      url: req.file.path,
      publicId: req.file.filename,
    };
  }
  const result = await authService.register({ body: parsedBody, avatar });
  setAuthCookies(res, result.accessToken, result.refreshToken);
  res.status(201).json({
    message: "Account created successfully",
    user: result.user,
  });
};

/**
 * @route POST /api/auth/login
 * @desc Login a user
 * @access Public
 */
const login = async (req: Request, res: Response) => {
  const parsedBody = loginSchema.parse(req.body);
  const result = await authService.login(parsedBody);
  setAuthCookies(res, result.accessToken, result.refreshToken);
  res.status(200).json({
    message: "Logged in successfully",
    user: result.user,
  });
};

/**
 * @route POST /api/auth/logout
 * @desc Logout a user
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
 * @route POST /api/auth/refresh-access-token
 * @desc Refresh access token using refresh token
 * @access Public (but requires refresh token cookie)
 */
const refreshAccessToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  const decodedToken = verifyRefreshToken(refreshToken);
  const { newAccessToken, newRefreshToken } =
    await authService.refreshAccessToken(decodedToken);
  setAuthCookies(res, newAccessToken, newRefreshToken);
  res.status(200).json({
    message: "Access token refreshed successfully",
  });
};

/**
 * @route POST /api/auth/request-reset-password
 * @desc Request reset password
 * @access Public
 */
const requestResetPassword = async (req: Request, res: Response) => {
  const parsedBody = requestResetPasswordSchema.parse(req.body);
  await authService.requestResetPassword(parsedBody.email);
  res.status(200).json({
    message: "If an account exists, a reset email has been sent",
  });
};

/**
 * @route POST /api/auth/reset-password/:token
 * @desc Reset password
 * @access Public
 */
const resetPassword = async (req: Request, res: Response) => {
  const token = req.params.token as string;
  const parsedBody = resetPasswordSchema.parse(req.body);
  await authService.resetPassword(token, parsedBody.newPassword);
  res.status(200).json({
    message: "Password updated successfully",
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

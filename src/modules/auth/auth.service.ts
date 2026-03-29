import bcrypt from "bcryptjs";

import crypto from "crypto";
import mongoose from "mongoose";
import { generateTokens, verifyRefreshToken } from "../../shared/utils/jwt";
import AppError from "../../shared/utils/AppError";
import User from "../users/User.model";
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from "./auth.dto";
import { sendResetPasswordEmail } from "../../shared/services/email.service";

export const register = async (body: RegisterDto) => {
  const userExists = await User.findOne({ email: body.email });
  if (userExists) {
    throw new AppError("User already exists", 400);
  }
  const user = await User.create(body);
  const { accessToken, refreshToken } = generateTokens(user._id);
  return {
    user,
    accessToken,
    refreshToken,
  };
};

export const login = async (body: LoginDto) => {
  const user = await User.findOne({ email: body.email });
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }
  const isMatch = await bcrypt.compare(body.password, user.password);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }
  const { accessToken, refreshToken } = generateTokens(user._id);
  return {
    user,
    accessToken,
    refreshToken,
  };
};

export const refreshAccessToken = async (refreshToken: string) => {
  const decodedToken = verifyRefreshToken(refreshToken);
  if (!decodedToken) {
    throw new AppError("Invalid refresh token", 401);
  }
  const user = await User.findById(decodedToken.userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
    generateTokens(user._id);
  return {
    newAccessToken,
    newRefreshToken,
  };
};

export const forgotPassword = async ({ email }: ForgotPasswordDto) => {
  const user = await User.findOne({ email });
  if (!user) {
    return;
  }
  const resetPasswordToken = user.createPasswordResetToken();
  await sendResetPasswordEmail(user.email, resetPasswordToken);
};

export const resetPassword = async (
  token: string,
  { newPassword }: ResetPasswordDto
) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    throw new AppError("Invalid or expired token", 400);
  }
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
};

export const getMe = async (myId: mongoose.Types.ObjectId) => {
  const me = await User.findById(myId);
  if (!me) {
    throw new AppError("User not found", 404);
  }
  return me;
};

import bcrypt from "bcryptjs";
import User from "../models/User.model";
import { LoginBody, RegisterBody } from "../schemas/auth.schema";
import AppError from "../utils/AppError";
import { generateAccessToken, generateRefreshToken } from "../utils/token";
import { JwtPayload } from "../types/utilTypes";
import { sendResetPasswordEmail } from "../utils/nodemailer";
import crypto from "crypto";

const register = async (body: RegisterBody) => {
  const user = await User.create(body);
  const tokenVersion = 0; // Initial token version
  user.tokenVersion = tokenVersion;
  await user.save();

  const accessToken = generateAccessToken({
    userId: user._id.toString(),
    tokenVersion,
  });
  const refreshToken = generateRefreshToken({
    userId: user._id.toString(),
    tokenVersion,
  });

  return {
    user,
    accessToken,
    refreshToken,
  };
};

const login = async (body: LoginBody) => {
  const user = await User.findOne({ email: body.email });
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }
  const isPasswordValid = await bcrypt.compare(body.password, user.password);
  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }
  const accessToken = generateAccessToken({
    userId: user._id.toString(),
    tokenVersion: user.tokenVersion,
  });
  const refreshToken = generateRefreshToken({
    userId: user._id.toString(),
    tokenVersion: user.tokenVersion,
  });
  return {
    user,
    accessToken,
    refreshToken,
  };
};

const logout = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  user.tokenVersion += 1; // Invalidate existing access tokens
  await user.save();
};

const refreshAccessToken = async (decodedToken: JwtPayload) => {
  const user = await User.findById(decodedToken.userId);
  if (!user || user.tokenVersion !== decodedToken.tokenVersion) {
    throw new AppError("Invalid refresh token", 401);
  }
  const newAccessToken = generateAccessToken({
    userId: user._id.toString(),
    tokenVersion: user.tokenVersion,
  });
  const newRefreshToken = generateRefreshToken({
    userId: user._id.toString(),
    tokenVersion: user.tokenVersion,
  });
  return {
    newAccessToken,
    newRefreshToken,
  };
};

const requestResetPassword = async (email: string) => {
  const user = await User.findOne({ email });
  const message = "If an account exists, a reset email has been sent";
  if (!user) {
    return { message };
  }
  const resetPasswordToken = user.createPasswordResetToken();
  await user.save();
  await sendResetPasswordEmail(user.email, resetPasswordToken);
  return {
    message,
  };
};

const resetPassword = async (token: string, newPassword: string) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    throw new AppError("Invalid or expired token", 400);
  }

  user.password = newPassword;
  user.tokenVersion += 1;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  return {
    message: "Password updated successfully",
  };
};

export default {
  register,
  login,
  logout,
  refreshAccessToken,
  requestResetPassword,
  resetPassword,
};

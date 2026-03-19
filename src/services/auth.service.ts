import bcrypt from "bcryptjs";
import User from "../models/User.model";
import { LoginBody, RegisterBody } from "../schemas/auth.schema";
import AppError from "../utils/AppError";
import { generateAccessToken, generateRefreshToken } from "../utils/token";
import { JwtPayload } from "../types/utilTypes";
import { sendResetPasswordEmail } from "../utils/nodemailer";
import crypto from "crypto";
import mongoose from "mongoose";

const generateTokens = (userId: mongoose.Types.ObjectId) => {
  const accessToken = generateAccessToken({ userId });
  const refreshToken = generateRefreshToken({ userId });
  return { accessToken, refreshToken };
};

const register = async ({
  body,
  avatar,
}: {
  body: RegisterBody;
  avatar?: { url: string; publicId: string };
}) => {
  const user = await User.create({ ...body, avatar });

  const { accessToken, refreshToken } = generateTokens(user._id);

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
  const { accessToken, refreshToken } = generateTokens(user._id);
  return {
    user,
    accessToken,
    refreshToken,
  };
};

const refreshAccessToken = async (decodedToken: JwtPayload | null) => {
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

const requestResetPassword = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    return;
  }
  const resetPasswordToken = user.createPasswordResetToken();
  await user.save();
  await sendResetPasswordEmail(user.email, resetPasswordToken);
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
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
};

const getMe = async (userId: mongoose.Types.ObjectId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
};

export default {
  register,
  login,
  refreshAccessToken,
  requestResetPassword,
  resetPassword,
  getMe,
};

import bcrypt from "bcryptjs";
import User from "../models/User.model";
import { LoginBody, RegisterBody } from "../schemas/auth.schema";
import AppError from "../utils/AppError";
import { generateAccessToken, generateRefreshToken } from "../utils/token";
import { JwtPayload } from "../utils/types";

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
  await user.save();
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
  if (!user) {
    throw new AppError("User not found", 404);
  }
  if (user.tokenVersion !== decodedToken.tokenVersion) {
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
  await user.save();
  return {
    newAccessToken,
    newRefreshToken,
  };
};

export default {
  register,
  login,
  logout,
  refreshAccessToken,
};

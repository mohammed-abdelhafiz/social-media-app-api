import bcrypt from "bcryptjs";
import User from "../models/User.model";
import { LoginBody, RegisterBody } from "../schemas/auth.schema";
import AppError from "../utils/AppError";
import { generateAccessToken, generateRefreshToken } from "../utils/token";

const register = async (body: RegisterBody) => {
  const user = await User.create(body);
  const accessToken = generateAccessToken({ id: user._id.toString() });
  const refreshToken = generateRefreshToken({ id: user._id.toString() });
  user.refreshToken = refreshToken;
  await user.save();
  return {
    user,
    accessToken,
    refreshToken,
  };
};

const login = async (body: LoginBody) => {
  const user = await User.findOne({ email: body.email });
  if (!user) {
    throw new AppError("Invalid email or password", 401, ["email", "password"]);
  }
  const isPasswordValid = await bcrypt.compare(body.password, user.password);
  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401, ["email", "password"]);
  }
  const accessToken = generateAccessToken({ id: user._id.toString() });
  const refreshToken = generateRefreshToken({ id: user._id.toString() });
  user.refreshToken = refreshToken;
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
    throw new AppError("User not found", 404, ["userId"]);
  }
  user.refreshToken = "";
  await user.save();
};

const refreshAccessToken = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404, ["userId"]);
  }
  const accessToken = generateAccessToken({ id: user._id.toString() });
  const refreshToken = generateRefreshToken({ id: user._id.toString() });
  user.refreshToken = refreshToken;
  await user.save();
  return {
    user,
    accessToken,
    refreshToken,
  };
};

export default {
  register,
  login,
  logout,
  refreshAccessToken,
};

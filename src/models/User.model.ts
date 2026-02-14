/* eslint-disable @typescript-eslint/no-unused-vars */
import mongoose from "mongoose";
import type { HydratedDocument, Model } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

interface IUser {
  name: string;
  username: string;
  email: string;
  password: string;
  tokenVersion: number;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
}

interface IUserMethods {
  createPasswordResetToken(): string;
}

export type UserDocument = HydratedDocument<IUser, IUserMethods>;

export type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new mongoose.Schema<IUser, UserModel, IUserMethods>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: 3,
      maxLength: 30,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minLength: 3,
      maxLength: 15,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minLength: 6,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (this: UserDocument) {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.toJSON = function (this: UserDocument) {
  const user = this.toObject();

  const {
    password,
    tokenVersion,
    resetPasswordToken,
    resetPasswordExpire,
    __v,
    ...safeUser
  } = user;

  return safeUser;
};

userSchema.methods.createPasswordResetToken = function (this: UserDocument) {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  return resetToken;
};

const User = mongoose.model<IUser, UserModel>("User", userSchema);

export default User;

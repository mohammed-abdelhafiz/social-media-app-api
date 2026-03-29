/* eslint-disable @typescript-eslint/no-unused-vars */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

interface UserDocument extends mongoose.Document {
  name: string;
  username: string;
  email: string;
  password: string;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  bio?: string;
  avatar?: {
    url: string;
    publicId: string;
  };
  coverImage?: {
    url: string;
    publicId: string;
  }
  followersCount: number;
  followingCount: number;
  postsCount: number;
  createPasswordResetToken(): string;
}

const userSchema = new mongoose.Schema<UserDocument>(
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
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    bio: {
      type: String,
      trim: true,
      maxLength: 160,
      default: "",
    },
    avatar: {
      type: {
        url: String,
        publicId: String,
      },
      default: {
        url: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
        publicId: "default-avatar",
      },
    },
    coverImage: {
      type: {
        url: String,
        publicId: String,
      },
      default: {
        url: "https://images.unsplash.com/photo-1660491630578-4299a3c09db0?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        publicId: "default-cover",
      },
    },
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    postsCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (this) {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.toJSON = function (this) {
  const user = this.toObject();

  const {
    password,
    resetPasswordToken,
    resetPasswordExpire,
    __v,
    ...safeUser
  } = user;

  return safeUser;
};

userSchema.methods.createPasswordResetToken =async function (this) {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await this.save();

  return resetToken;
};

const User = mongoose.model<UserDocument>("User", userSchema);

export default User;

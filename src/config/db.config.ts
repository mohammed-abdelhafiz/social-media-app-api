import mongoose from "mongoose";

export const connectToDb = async () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not defined");
  }
  await mongoose.connect(connectionString, {
    dbName: process.env.NODE_ENV,
  });
  console.log("Connected to MongoDB successfully ✅");
};

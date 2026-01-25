import mongoose from "mongoose";

export const connectToDb = async () => {
  const connectionString = process.env.MONGO_DB_URI;
  if (!connectionString) {
    throw new Error("MONGO_DB_URI is not defined");
  }
  await mongoose.connect(connectionString, {
    dbName: process.env.NODE_ENV,
  });
  console.log("Connected to MongoDB successfully ✅");
};

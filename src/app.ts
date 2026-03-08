import express from "express";
import errorHandler from "./middlewares/errorHandler";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import postsRoutes from "./routes/posts.routes";
import notFoundHandler from "./middlewares/notFoundHandler";
import cors from "cors";

// Initialize app
const app = express();

// Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// mount routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postsRoutes);

// handle unhandled routes
app.use(notFoundHandler);

// error handler
app.use(errorHandler);

export default app;

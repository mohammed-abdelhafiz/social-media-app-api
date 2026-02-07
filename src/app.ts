import express from "express";
import errorHandler from "./middlewares/errorHandler";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import postsRoutes from "./routes/posts.routes";
// Initialize app
const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());

// mount routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postsRoutes);

// error handler
app.use(errorHandler);

export default app;

import express from "express";
import errorHandler from "./middlewares/errorHandler";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import usersRoutes from "./routes/user.routes";
import postsRoutes from "./routes/post.routes";
import commentsRoutes from "./routes/comment.routes";
import notFoundHandler from "./middlewares/notFoundHandler";

// Initialize app
const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());

// mount routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/comments", commentsRoutes);

// handle unhandled routes
app.use(notFoundHandler);

// error handler
app.use(errorHandler);

export default app;

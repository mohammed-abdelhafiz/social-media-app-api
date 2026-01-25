import express from "express";
import authRoutes from "./routes/auth.routes";
import errorHandler from "./middlewares/errorHandler.middleware";
import cookieParser from "cookie-parser";
// Initialize app
const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());

// mount routes
app.use("/api/auth", authRoutes);


// error handler
app.use(errorHandler);

export default app;

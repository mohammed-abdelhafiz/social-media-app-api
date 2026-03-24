import express from "express";
import errorHandler from "./shared/middlewares/errorHandler.middleware";
import cookieParser from "cookie-parser";
import router from "./routes";
import notFoundHandler from "./shared/middlewares/notFoundHandler.middleware";

// Initialize app
const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api", router);

// unhandled routes
app.use(notFoundHandler);

// global error handler
app.use(errorHandler);

export default app;

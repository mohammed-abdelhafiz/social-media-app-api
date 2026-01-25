import express from "express";
import type { Request, Response } from "express";

const app = express();

// Middlewares
app.use(express.json());

// Example route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello from Express + TypeScript!");
});

export default app;

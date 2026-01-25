import dotenv from "dotenv";
import app from "./app";
import { connectToDb } from "./config/db.config";
dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectToDb();
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

startServer();

import "./shared/config/env.config";
import app from "./app";
import { connectToDb } from "./shared/config/db.config";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectToDb();
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

startServer();

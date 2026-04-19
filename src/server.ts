import "@/shared/config/env.config";
import app from "@/app";
import { connectToDb } from "@/shared/config/db.config";

const PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
  try {
    await connectToDb();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

startServer();

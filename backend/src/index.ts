import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { initializeDatabase } from "./config/database";

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    // Initialize database and load data
    await initializeDatabase();
    console.log("✅ Database initialized successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 API endpoints available:`);
      console.log(`   - GET /api/summary`);
      console.log(`   - GET /api/drivers`);
      console.log(`   - GET /api/risk-factors`);
      console.log(`   - GET /api/recommendations`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

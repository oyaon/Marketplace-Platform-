require("dotenv").config();
const fs = require("fs");
const path = require("path");
const app = require("./app");
const prisma = require("./config/prisma");

const PORT = process.env.PORT || 5000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("Created uploads directory:", uploadsDir);
}

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log("PostgreSQL connected");

    // Start the server
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log("Server is listening and ready for connections...");
    });

    // Handle server errors
    server.on('error', (err) => {
      console.error("Server error:", err);
      process.exit(1);
    });
  } catch (error) {
    console.error("Failed to connect to database", error);
    process.exit(1);
  }
};

startServer();


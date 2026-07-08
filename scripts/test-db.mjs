import mongoose from "mongoose";

try {
  process.loadEnvFile?.(".env");
} catch {}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set (add it to .env)");
  process.exit(1);
}
try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  console.log("MongoDB connection OK:", mongoose.connection.name);
  await mongoose.disconnect();
} catch (e) {
  console.error("MongoDB connection failed:", e.message);
  process.exit(1);
}

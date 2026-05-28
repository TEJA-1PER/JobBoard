import mongoose from "mongoose";

export const connectDB = async () => {
  const uri = (process.env.MONGODB_URI || process.env.MONGO_URI)?.trim();
  if (!uri) throw new Error("MONGODB_URI or MONGO_URI is required");
  if (uri.includes("<password>") || uri.includes("<username>")) {
    throw new Error(
      "MONGODB_URI still contains <password> or <username> placeholders — replace them with your Atlas credentials"
    );
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000
    });
    console.log("MongoDB connected");
  } catch (error) {
    const isLocalMongo = uri.includes("localhost:27017") || uri.includes("127.0.0.1:27017");
    const hint = isLocalMongo
      ? "MongoDB is not running on localhost:27017. Start MongoDB or use Atlas MONGODB_URI."
      : "Unable to connect to MongoDB. In Atlas: Network Access must allow 0.0.0.0/0, and MONGODB_URI user/password must be correct (URL-encode special characters in the password).";
    throw new Error(`${hint} Original error: ${error.message}`);
  }
};

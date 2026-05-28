import mongoose from "mongoose";

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error("MONGODB_URI or MONGO_URI is required");
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log("MongoDB connected");
  } catch (error) {
    const isLocalMongo = uri.includes("localhost:27017") || uri.includes("127.0.0.1:27017");
    const hint = isLocalMongo
      ? "MongoDB is not running on localhost:27017. Start MongoDB service or use a cloud MONGODB_URI."
      : "Unable to connect to MongoDB. Verify MONGODB_URI, network access, and database credentials.";
    throw new Error(`${hint} Original error: ${error.message}`);
  }
};

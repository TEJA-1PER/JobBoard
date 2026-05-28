import mongoose from "mongoose";

const cleanEnv = (value) => value?.trim().replace(/^["']|["']$/g, "") || "";

export const connectDB = async () => {
  const uri = cleanEnv(process.env.MONGODB_URI) || cleanEnv(process.env.MONGO_URI);
  if (!uri) throw new Error("MONGODB_URI or MONGO_URI is required");
  if (uri.startsWith("mongodb://localhost") || uri.startsWith("mongodb://127.0.0.1")) {
    throw new Error("MONGODB_URI points to localhost — use your Atlas connection string on Render");
  }
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
    const authHint =
      /bad auth|authentication failed/i.test(error.message)
        ? " Password or username in MONGODB_URI is wrong. In Atlas: Database Access → edit user → reset password → paste the new password into MONGODB_URI (URL-encode special characters)."
        : "";
    throw new Error(`${hint}${authHint} Original error: ${error.message}`);
  }
};

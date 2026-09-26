import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

let isConnected = false;
let reconnectTimer = null;
let isConnecting = false;

const connectDB = async () => {
  // Already connected
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  // Prevent multiple simultaneous connection attempts
  if (isConnecting) {
    return;
  }

  isConnecting = true;

  try {
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not defined");
    }

    console.log("🔄 Connecting to MongoDB...");

    const conn = await mongoose.connect(MONGO_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = conn.connection.readyState === 1;

    console.log("✅ MongoDB Connected");
  } catch (error) {
    isConnected = false;

    console.error("❌ DB Connection Error:", error.message);

    scheduleReconnect();
  } finally {
    isConnecting = false;
  }
};

const scheduleReconnect = () => {
  // Don't create multiple reconnect timers
  if (reconnectTimer) {
    return;
  }

  console.log("🔁 Retrying MongoDB connection in 5 seconds...");

  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    await connectDB();
  }, 5000);
};

// MongoDB successfully connected
mongoose.connection.on("connected", () => {
  isConnected = true;

  console.log("🟢 MongoDB connection established");

  // Cancel pending reconnect
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
});

// MongoDB disconnected
mongoose.connection.on("disconnected", () => {
  isConnected = false;

  console.warn("⚠️ MongoDB disconnected");

  scheduleReconnect();
});

// MongoDB error
mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB error:", err.message);
});

export default connectDB;

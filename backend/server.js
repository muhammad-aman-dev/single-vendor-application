import dotenv from "dotenv";

dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "./config/passport.js";
import connectDB from "./lib/dbConnect.js";
import userRouter from "./routes/userRoute.js";
import authRouter from "./routes/authRoute.js";
import productRouter from "./routes/productRoutes.js";
import generalRouter from "./routes/generalRoute.js";
import carouselRouter from "./routes/crouselRouter.js";
import adminRouter from "./routes/adminRouter.js";
import ordersRouter from "./routes/orderRouter.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ------------------- MIDDLEWARE -------------------

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// ------------------- ROUTES -------------------

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/admin/product", productRouter);
app.use("/api/general", generalRouter);
app.use("/api/admin/crousels", carouselRouter);
app.use("/api/admin/pror", adminRouter);
app.use("/api/order", ordersRouter);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.get("/favicon.ico", (req, res) => res.status(204));
app.get("/favicon.png", (req, res) => res.status(204));


app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running smoothly",
  });
});

// ------------------- ERROR HANDLING -------------------

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
});

await connectDB();

export default app;

import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { toNodeHandler } from "better-auth/node";
import path from "path";
import authRouter from "./module/auth/auth.router";
import userRouter from "./module/user/user.router";

import { globalErrorHandler } from "./middleware/globalErrorHandler";
import { notFoundMiddleware } from "./middleware/notFound";
import { envVars } from "./config/env";
import { auth } from "./lib/auth";
import { prisma } from "./lib/prisma";
import carRouter from "./module/car/car.router";
import bookingRouter from "./module/booking/booking.router";
import paymentRouter from "./module/payment/payment.router";
import driverRouter from "./module/driver/driver.router";
import reviewRouter from "./module/review/review.router";
import couponRouter from "./module/coupon/coupon.router";
import dashboardRouter from "./module/dashboard/dashboard.router";
import hostRouter from "./module/host/host.router";

const app: Express = express();

app.set("trust proxy", true);

app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), `src/app/templates`));

app.use(
  cors({
    origin: [
      envVars.FRONTEND_URL,
      envVars.BETTER_AUTH_URL,
      "http://localhost:3000",
      "http://localhost:5000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Better Auth handler (must be before body parsers)
app.use("/api/auth", toNodeHandler(auth));

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// server health check
app.get("/", (_req, res) => {
  res.status(200).send("Skill SVG Server is running...");
});

app.use("/auth", authRouter);
app.use("/users", userRouter);

// temporary db test
app.get("/db-test", async (req, res) => {
  try {
    await prisma.$connect();
    res.json({ success: true, message: "Database connected" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, error: "Database connection failed" });
  }
});

app.use("/cars", carRouter);
app.use("/bookings", bookingRouter);
app.use("/payments", paymentRouter);
app.use("/drivers", driverRouter);
app.use("/reviews", reviewRouter);
app.use("/coupons", couponRouter);
app.use("/admin/dashboard", dashboardRouter);
app.use("/hosts", hostRouter);

app.use(globalErrorHandler);
app.use(notFoundMiddleware);

export default app;

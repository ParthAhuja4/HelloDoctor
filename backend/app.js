import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { stripeWebhook } from "./controllers/user.controller.js";

const app = express();
app.post(
  "/stripe/webhook",
  bodyParser.raw({ type: "application/json" }),
  stripeWebhook
);

app.use(express.json());
app.use(cors());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

import adminRouter from "./routes/admin.route.js";
import doctorRouter from "./routes/doctor.route.js";
import userRouter from "./routes/user.route.js";

app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/doctor", doctorRouter);
app.use("/api/v1/user", userRouter);

export default app;

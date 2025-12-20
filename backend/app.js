import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

import adminRouter from "./routes/admin.route.js";
app.use("/api/v1/admin", adminRouter);

export default app;

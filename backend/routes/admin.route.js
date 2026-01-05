import express from "express";
import {
  addDoctor,
  allAppointments,
  allDoctors,
  loginAdmin,
  cancelAppointment,
  adminDashboard,
} from "../controllers/admin.controller.js";
import upload from "../middlewares/multer.middleware.js";
import verifyAdminJWT from "../middlewares/authAdmin.middleware.js";
import { changeAvailability } from "../controllers/doctor.controller.js";

const adminRouter = express.Router();

adminRouter.post(
  "/add-doctor",
  verifyAdminJWT,
  upload.single("image"),
  addDoctor
);
adminRouter.post("/login", loginAdmin);
adminRouter.get("/all-doctors", verifyAdminJWT, allDoctors);
adminRouter.get("/dashboard", verifyAdminJWT, adminDashboard);
adminRouter.get("/appointments", verifyAdminJWT, allAppointments);
adminRouter.post("/change-availability", verifyAdminJWT, changeAvailability);
adminRouter.post("/cancel-appointment", verifyAdminJWT, cancelAppointment);

export default adminRouter;

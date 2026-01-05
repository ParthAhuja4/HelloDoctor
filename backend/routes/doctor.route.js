import {
  appointmentComplete,
  cancelAppointment,
  doctorDashboard,
  doctorList,
  doctorProfile,
  listAppointment,
  loginDoctor,
  updateDoctorProfile,
} from "../controllers/doctor.controller.js";
import { Router } from "express";
import authUser from "../middlewares/authUser.middleware.js";
import authDoctor from "../middlewares/authDoctor.middleware.js";

const doctorRouter = Router();

doctorRouter.get("/list", authUser, doctorList);
doctorRouter.post("/login", loginDoctor);
doctorRouter.get("/appointments", authDoctor, listAppointment);
doctorRouter.get("/profile", authDoctor, doctorProfile);
doctorRouter.get("/dashboard", authDoctor, doctorDashboard);
doctorRouter.post("/cancel-appointment", authDoctor, cancelAppointment);
doctorRouter.post("/complete-appointment", authDoctor, appointmentComplete);
doctorRouter.post("/update-profile", authDoctor, updateDoctorProfile);

export default doctorRouter;

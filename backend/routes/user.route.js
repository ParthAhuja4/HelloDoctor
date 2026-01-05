import { Router } from "express";
import {
  cancelAppointment,
  getProfile,
  initiateBooking,
  listAppointment,
  loginUser,
  registerUser,
  updateProfile,
} from "../controllers/user.controller.js";
import authUser from "../middlewares/authUser.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const userRouter = Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/get-profile", authUser, getProfile);
userRouter.post("/initiate-appointment", authUser, initiateBooking);
userRouter.get("/appointments", authUser, listAppointment);
userRouter.post("/cancel-appointment", authUser, cancelAppointment);
userRouter.post(
  "/update-profile",
  authUser,
  upload.single("image"),
  updateProfile
);

export default userRouter;

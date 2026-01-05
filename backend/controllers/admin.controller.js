import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import validator from "validator";
import bcrypt from "bcrypt";
import uploadOnCloudinary from "../services/cloudinary.service.js";
import Doctor from "../models/doctor.model.js";
import ApiResponse from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import fs from "fs";
import Appointment from "../models/appointment.model.js";
import { stripe } from "./user.controller.js";
import mongoose from "mongoose";
import User from "../models/user.model.js";

export const addDoctor = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    speciality,
    degree,
    experience,
    about,
    fees,
    address,
  } = req.body;

  if (!req?.file?.path) {
    throw new ApiError(400, "Missing Details. Enter All details");
  }
  if (
    !name ||
    !email ||
    !password ||
    !speciality ||
    !degree ||
    !experience ||
    !about ||
    !fees ||
    !address
  ) {
    await fs.promises.unlink(req.file.path);
    throw new ApiError(400, "Missing Details. Enter All details");
  }

  if (!validator.isEmail(email)) {
    await fs.promises.unlink(req.file.path);
    throw new ApiError(422, "Invalid Email");
  }

  if (!validator.isStrongPassword(password)) {
    await fs.promises.unlink(req.file.path);
    throw new ApiError(422, "Try a stronger password");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const uploadedImage = await uploadOnCloudinary(req.file.path);

  if (!uploadedImage) {
    throw new ApiError(500, "Image couldnt be uploaded");
  }
  const doctor = await Doctor.create({
    name,
    password: hashedPassword,
    image: uploadedImage.secure_url,
    email,
    speciality,
    degree,
    experience,
    about,
    fees,
    address: JSON.parse(address),
    date: Date.now(),
  });

  const doctorObj = doctor.toObject();
  delete doctorObj.password;
  delete doctorObj.__v;

  return res
    .status(201)
    .json(new ApiResponse(201, doctorObj, "Doctor registered Successfully"));
});

export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (
    email != process.env.ADMIN_EMAIL ||
    password != process.env.ADMIN_PASSWORD
  ) {
    throw new ApiError(401, "Invalid Credentials");
  }

  const token = jwt.sign({ email, password }, process.env.JWT_SECRET, {
    expiresIn: process.env.ADMIN_ACCESS_TOKEN_EXPIRY,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { token }, "Admin Logged In"));
});

export const allDoctors = asyncHandler(async (_, res) => {
  const allDrs = await Doctor.find({}).select("-password");
  if (!allDrs) throw new ApiError(404, "No Doctors Data");
  return res.status(200).json(new ApiResponse(200, allDrs, "Fetched"));
});

export const allAppointments = asyncHandler(async (_, res) => {
  const appointmentsList = await Appointment.find({});
  res.status(200).json(new ApiResponse(200, appointmentsList, "Fetched"));
});

export const cancelAppointment = asyncHandler(async (req, res) => {
  const { appointmentId } = req.body;

  // Fetch appointment (outside transaction)
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new ApiError(404, "Appointment not found");
  }

  if (appointment.status === "cancelled") {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Appointment already cancelled"));
  }

  // If CONFIRMED : initiate refund FIRST
  let refund;
  if (appointment.status === "confirmed") {
    if (!appointment.paymentIntentId) {
      throw new ApiError(400, "Payment reference missing");
    }

    refund = await stripe.refunds.create({
      payment_intent: appointment.paymentIntentId,
      reason: "requested_by_customer",
    });
  }

  //Atomic DB update (cancel + slot release)
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    await Appointment.findByIdAndUpdate(
      appointmentId,
      {
        status: "cancelled",
        refundedAt: appointment.status === "confirmed" ? new Date() : null,
        refundId: refund?.id,
      },
      { session }
    );

    await Doctor.findByIdAndUpdate(
      appointment.docId,
      {
        $pull: {
          [`slots_booked.${appointment.slotDate}`]: appointment.slotTime,
        },
      },
      { session }
    );

    await session.commitTransaction();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          refundId: refund?.id || null,
        },
        appointment.status === "confirmed"
          ? "Appointment cancelled and refunded"
          : "Appointment cancelled"
      )
    );
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

export const adminDashboard = asyncHandler(async (req, res) => {
  const doctors = await Doctor.find({});
  const users = await User.find({});
  const appointments = await Appointment.find({});

  const dashData = {
    doctors: doctors.length,
    appointments: appointments.length,
    patients: users.length,
    latestAppointments: appointments.reverse().slice(0, 5),
  };

  return res
    .status(200)
    .json(new ApiResponse(200, dashData, "Dashboard Data Fetched"));
});

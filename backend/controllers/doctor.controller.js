import Doctor from "../models/doctor.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import Appointment from "../models/appointment.model.js";
import mongoose from "mongoose";
import { stripe } from "./user.controller.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const changeAvailability = asyncHandler(async (req, res) => {
  const { docId } = req.body;
  const doctor = await Doctor.findByIdAndUpdate(
    docId,
    [{ $set: { available: { $not: "$available" } } }],
    { new: true }
  );

  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, doctor, "Availability Changed"));
});

export const doctorList = asyncHandler(async (req, res) => {
  const allDoctors = await Doctor.find({}).select(["-password", "-email"]);
  if (!allDoctors) throw new ApiError(404, "No Doctors Data");
  return res.status(200).json(new ApiResponse(200, allDoctors, "Fetched"));
});

export const loginDoctor = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const doctor = await Doctor.findOne({ email });

  if (!doctor) {
    throw new ApiError(404, "Doctor Not Found");
  }

  const isMatch = await bcrypt.compare(password, doctor.password);

  if (isMatch) {
    const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.USER_ACCESS_TOKEN_EXPIRY,
    });

    res.status(200).json(new ApiResponse(200, { token }, "Doctor Logged In"));
  } else {
    throw new ApiError(401, "Invalid Credentials");
  }
});

export const listAppointment = asyncHandler(async (req, res) => {
  const { docId } = req;
  const appointments = await Appointment.find({ docId });

  return res
    .status(200)
    .json(new ApiResponse(200, { appointments }, "Appointments fetched"));
});

export const cancelAppointment = asyncHandler(async (req, res) => {
  const { docId } = req;
  const { appointmentId } = req.body;

  // Fetch appointment (outside transaction)
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new ApiError(404, "Appointment not found");
  }

  if (appointment.docId.toString() !== docId) {
    throw new ApiError(401, "Unauthorized action");
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

export const appointmentComplete = asyncHandler(async (req, res) => {
  const { docId } = req;
  const { appointmentId } = req.body;

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment || appointment.docId.toString() !== docId) {
    throw new ApiError(403, "Invalid doctor or appointment");
  }

  await Appointment.findByIdAndUpdate(appointmentId, {
    isCompleted: true,
  });
  return res
    .status(200)
    .json({ success: true, message: "Appointment Completed" });
});

export const doctorProfile = asyncHandler(async (req, res) => {
  const { docId } = req;
  const profile = await Doctor.findById(docId).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, { profileData: profile }, "Fetched"));
});

export const doctorDashboard = asyncHandler(async (req, res) => {
  const { docId } = req;
  const appointments = await Appointment.find({ docId });

  let earnings = 0;
  const patientSet = new Set();

  appointments?.forEach((a) => {
    if (a.status === "confirmed" && typeof a.amount === "number")
      earnings += a.amount;
    patientSet.add(a.userId.toString());
  });

  const dashData = {
    earnings,
    appointments: appointments.length,
    patients: patientSet.size,
    latestAppointments: appointments.reverse().slice(0, 5),
  };

  return res
    .status(200)
    .json(new ApiResponse(200, { dashData }, "Dashboard Data Fetched"));
});

export const updateDoctorProfile = asyncHandler(async (req, res) => {
  const { docId } = req;
  const { fees, address, available, about } = req.body;

  await Doctor.findByIdAndUpdate(docId, {
    fees,
    address,
    available,
    about,
  });

  return res.json({ success: true, message: "Profile Updated" });
});

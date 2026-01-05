import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import validator from "validator";
import bcrypt from "bcrypt";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/apiResponse.js";
import uploadOnCloudinary from "../services/cloudinary.service.js";
import Appointment from "../models/appointment.model.js";
import Doctor from "../models/doctor.model.js";
import mongoose from "mongoose";
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    throw new ApiError(400, "Missing Details. Enter All details");
  }

  if (!validator.isEmail(email)) {
    throw new ApiError(422, "Invalid Email");
  }

  if (!validator.isStrongPassword(password)) {
    throw new ApiError(422, "Try a stronger password");
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    password: hashedPassword,
    email,
  });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.USER_ACCESS_TOKEN_EXPIRY,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { token }, "User registered Successfully"));
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User Not Found");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (isMatch) {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.USER_ACCESS_TOKEN_EXPIRY,
    });

    res.status(200).json(new ApiResponse(200, { token }, "User Logged In"));
  } else {
    throw new ApiError(401, "Invalid Credentials");
  }
});

export const getProfile = asyncHandler(async (req, res) => {
  const { userId } = req;
  const userData = await User.findById(userId).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, userData, "Profile Fetched"));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { userId } = req;
  const { name, phone, address, dob, gender } = req.body;
  const imageFile = req?.file;
  let uploadedImage;

  if (!name || !phone || !dob || !gender || !address) {
    if (req.file?.path) {
      await fs.promises.unlink(req.file.path);
    }
    throw new ApiError("Data Missing");
  }

  if (imageFile) {
    uploadedImage = await uploadOnCloudinary(req.file.path);
  }
  let data;
  if (!uploadedImage) {
    data = await User.findByIdAndUpdate(userId, {
      name,
      phone,
      address: JSON.parse(address),
      dob,
      gender,
    });
  } else {
    await User.findByIdAndUpdate(userId, {
      name,
      phone,
      address: JSON.parse(address),
      dob,
      gender,
      image: uploadedImage.secure_url,
    });
  }

  return res.status(200).json(new ApiResponse(200, data, "Profile Updated"));
});

export const initiateBooking = asyncHandler(async (req, res) => {
  const { userId } = req;
  const { docId, slotDate, slotTime } = req.body;

  const session = await mongoose.startSession();
  let appointment;

  try {
    session.startTransaction();

    // Locking slot atomically
    const doctor = await Doctor.findOneAndUpdate(
      {
        _id: docId,
        available: true,
        [`slots_booked.${slotDate}`]: { $ne: slotTime },
      },
      {
        $push: { [`slots_booked.${slotDate}`]: slotTime },
      },
      { new: true, session }
    );

    if (!doctor) {
      throw new ApiError(409, "Slot not available");
    }

    const docData = doctor.toObject();
    delete docData.slots_booked;
    delete docData.password;
    const userData = await User.findById(userId).select("-password");

    //Create pending appointment
    appointment = await Appointment.create(
      [
        {
          userId,
          docId,
          slotDate,
          slotTime,
          amount: doctor.fees,
          status: "pending",
          docData,
          userData,
          date: Date.now(),
        },
      ],
      { session }
    );

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }

  appointment = appointment[0];

  //Stripe Checkout (outside transaction)
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: { name: "Doctor Appointment" },
          unit_amount: appointment.amount * 100,
        },
        quantity: 1,
      },
    ],
    metadata: {
      appointmentId: appointment._id.toString(),
    },
    success_url: `${process.env.FRONTEND_URL}/my-appointments`,
    cancel_url: `${process.env.FRONTEND_URL}/my-appointments`,
  });

  await Appointment.findByIdAndUpdate(appointment._id, {
    stripeSessionId: checkoutSession.id,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { checkoutUrl: checkoutSession.url },
        "Proceed to payment"
      )
    );
});

export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const event = stripe.webhooks.constructEvent(
    req.body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  if (event.type === "checkout.session.completed") {
    const sessionData = event.data.object;

    await Appointment.findOneAndUpdate(
      {
        _id: sessionData.metadata.appointmentId,
        status: "pending",
      },
      {
        status: "confirmed",
        paymentIntentId: sessionData.payment_intent,
        paidAt: new Date(),
      }
    );
  }

  if (
    event.type === "checkout.session.expired" ||
    event.type === "payment_intent.payment_failed"
  ) {
    const sessionData = event.data.object;
    const appointment = await Appointment.findOne({
      stripeSessionId: sessionData.id,
      status: "pending",
    });

    if (appointment) {
      const dbSession = await mongoose.startSession();
      try {
        dbSession.startTransaction();

        await Appointment.findByIdAndUpdate(
          appointment._id,
          { status: "cancelled" },
          { session: dbSession }
        );

        await Doctor.findByIdAndUpdate(
          appointment.docId,
          {
            $pull: {
              [`slots_booked.${appointment.slotDate}`]: appointment.slotTime,
            },
          },
          { session: dbSession }
        );

        await dbSession.commitTransaction();
      } catch (err) {
        await dbSession.abortTransaction();
        throw err;
      } finally {
        dbSession.endSession();
      }
    }
  }

  return res.json({ received: true });
};

export const listAppointment = asyncHandler(async (req, res) => {
  const { userId } = req;
  const appointments = await Appointment.find({ userId });

  return res
    .status(200)
    .json(new ApiResponse(200, { appointments }, "Appointments fetched"));
});

export const cancelAppointment = asyncHandler(async (req, res) => {
  const { userId } = req;
  const { appointmentId } = req.body;

  // Fetch appointment (outside transaction)
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new ApiError(404, "Appointment not found");
  }

  if (appointment.userId.toString() !== userId) {
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

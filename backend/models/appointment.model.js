import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    docId: { type: String, required: true },
    slotDate: { type: String, required: true },
    slotTime: { type: String, required: true },
    userData: { type: Object, required: true },
    docData: { type: Object, required: true },
    amount: { type: Number, required: true },
    date: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    stripeSessionId: {
      type: String,
      index: true,
    },

    paymentIntentId: {
      type: String,
    },

    paidAt: {
      type: Date,
    },
    isCompleted: { type: Boolean, default: false },
    refundId: {
      type: String,
    },

    refundedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Appointment =
  mongoose.models.appointment ||
  mongoose.model("Appointment", appointmentSchema);
export default Appointment;

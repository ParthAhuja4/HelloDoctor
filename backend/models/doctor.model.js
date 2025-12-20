import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, required: true },
    speciality: { type: String, required: true },
    degree: { type: String, required: true },
    experience: { type: String, required: true },
    about: { type: String, required: true },
    available: { type: Boolean, default: true },
    fees: { type: Number, required: true },
    slots_booked: { type: Object, default: {} },
    address: { type: Object, required: true },
    date: { type: Number, required: true },
  },
  { minimize: false } //If a field is empty, e.g., slots_booked: {}, minimize: true(default behaviour) removes the field from the
  // document, while minimize: false keeps the field as {"slots_booked": {}}.
);

const Doctor = mongoose.models.doctor || mongoose.model("Doctor", doctorSchema);
export default Doctor;

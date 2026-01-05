import jwt from "jsonwebtoken";
import Doctor from "../models/doctor.model.js";

const authDoctor = async (req, res, next) => {
  try {
    const { dtoken } = req.headers;
    if (!dtoken) {
      return res.status(401).json({
        success: false,
        message: "Not Authorised!.. Login Again",
      });
    }
    const token_decode = jwt.verify(dtoken, process.env.JWT_SECRET);

    const doctor = await Doctor.findById(token_decode.id);

    if (!doctor) {
      res.status(404).json({ message: "Doctor Not Found" });
    }
    req.docId = token_decode.id;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default authDoctor;

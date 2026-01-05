import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// user userentication middleware
const authUser = async (req, res, next) => {
  try {
    const { token } = req.headers;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not Authorised!.. Login Again",
      });
    }
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(token_decode.id);

    if (!user) {
      res.status(404).json({ message: "User Not Found" });
    }
    req.userId = token_decode.id; //if dealing with multipart/form-data allways attach variables to the request itself not the body.. best practice
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default authUser;

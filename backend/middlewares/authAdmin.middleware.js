import jwt from "jsonwebtoken";

const verifyAdminJWT = (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Invalid Token",
      });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (
      decodedToken.email != process.env.ADMIN_EMAIL ||
      decodedToken.password != process.env.ADMIN_PASSWORD
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or Expired Token",
    });
  }
};

export default verifyAdminJWT;

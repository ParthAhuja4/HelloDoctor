import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import validator from "validator";
import bcrypt from "bcrypt";
import uploadOnCloudinary from "../services/cloudinary.service.js";
import Doctor from "../models/doctor.model.js";
import ApiResponse from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import fs from "fs";

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

  if (
    !name ||
    !email ||
    !password ||
    !speciality ||
    !degree ||
    !experience ||
    !about ||
    !fees ||
    !address ||
    !req?.file?.path
  ) {
    fs.unlinkSync(req?.file?.path);
    throw new ApiError(400, "Missing Details. Enter All details");
  }
  const existedDr = await Doctor.findOne({
    email,
  });

  if (existedDr) {
    fs.unlinkSync(req.file.path);
    throw new ApiError(409, "Dr with email already exists");
  }

  if (!validator.isEmail(email)) {
    fs.unlinkSync(req.file.path);
    throw new ApiError(422, "Invalid Email");
  }

  if (!validator.isStrongPassword(password)) {
    fs.unlinkSync(req.file.path);
    throw new ApiError(422, "Try a stronger password");
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
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
  const createdDoctor = await Doctor.findById(doctor._id).select("-password");
  if (!createdDoctor) {
    throw new ApiError(
      500,
      "Something went wrong while registering the doctor"
    );
  }

  return res
    .status(201)
    .json(
      new ApiResponse(201, createdDoctor, "Doctor registered Successfully")
    );
});

export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (
    email != process.env.ADMIN_EMAIL ||
    password != process.env.ADMIN_PASSWORD
  ) {
    throw new ApiError(401, "Wrong Email or Password");
  }

  const options = {
    httpOnly: true,
    secure: true,
  };

  const token = jwt.sign({ email, password }, process.env.JWT_SECRET, {
    expiresIn: process.env.ADMIN_ACCESS_TOKEN_EXPIRY,
  });

  res
    .status(200)
    .cookie("accessToken", token, options)
    .json(new ApiResponse(200, {}, "Admin Logged In"));
});

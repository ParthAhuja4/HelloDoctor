import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "image",
    });
    await fs.promises.unlink(localFilePath);
    return response;
  } catch (error) {
    await fs.promises.unlink(localFilePath);
    return null;
  }
};
export default uploadOnCloudinary;

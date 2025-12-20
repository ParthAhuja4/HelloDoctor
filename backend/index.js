import "dotenv/config";
import connectDB from "./config/db.js";
import app from "./app.js";
import connectCloudinary from "./config/cloudinary.js";

const startServer = async () => {
  try {
    await connectDB();
    await connectCloudinary();

    app.listen(process.env.PORT || 4000, () => {
      console.log(`API Server is running at port : ${process.env.PORT}`);
    });
  } catch (err) {
    console.log("Server startup failed !!!", err);
    process.exit(1);
  }
};

startServer();

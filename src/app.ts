import express from "express";
import dotenv from "dotenv";
import connectMongoDB from "./config/db.config";
import authRouter from "./routers/auth/auth.router";
import otpRouter from "./routers/otp/otp.router";
import { ErrorHandler } from "./middlewares/error/errorHandler.middleware";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const db = connectMongoDB;
db();

// routers
app.use("/auth", authRouter);
app.use("/otp", otpRouter);

app.use(ErrorHandler)

app.listen(port, (err) => {
  if (err) {
    console.log("Something went wrong with the server");
  } else {
    console.log(`Server is running on http://localhost:${port}`);
  }
});

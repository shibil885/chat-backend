import express from "express";
import dotenv from "dotenv";
import connectMongoDB from "./config/db.config";
import authRouter from "./routers/auth/auth.router";
import otpRouter from "./routers/otp/otp.router";
import chatRouter from './routers/chat/chat.router';
import messageRouter from './routers/messages/message.router';
import { ErrorHandler } from "./middlewares/error/errorHandler.middleware";
import cors from "cors";
import { authMiddleware } from "./middlewares/auth/auth.middleware";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const db = connectMongoDB;
db();

app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.urlencoded({extended: true}))
app.use(express.json())
// routers
app.use("/auth", authRouter);
app.use("/otp", otpRouter);
app.use("/chat", authMiddleware,chatRouter);
app.use("/message", authMiddleware,messageRouter);

app.use(ErrorHandler);

app.listen(port, (err) => {
  if (err) {
    console.log("Something went wrong with the server");
  } else {
    console.log(`Server is running on http://localhost:${port}`);
  }
});

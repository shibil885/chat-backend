import dotenv from "dotenv";
dotenv.config();
import express from "express";
import connectMongoDB from "./config/db.config";
import authRouter from "./routers/auth/auth.router";
import otpRouter from "./routers/otp/otp.router";
import chatRouter from "./routers/chat/chat.router";
import messageRouter from "./routers/messages/message.router";
import { ErrorHandler } from "./middlewares/error/errorHandler.middleware";
import cors from "cors";
import { authMiddleware } from "./middlewares/auth/auth.middleware";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import SocketService from "./services/socket/socket.service";

const app = express();
const httpServer = createServer(app);
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

const io = new Server(httpServer, {
  pingTimeout: 60000, // TODO
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});

app.set("io", io);
SocketService.initializeSocketIO(io);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// routers
app.use("/auth", authRouter);
app.use("/otp", otpRouter);
app.use("/chat", authMiddleware, chatRouter);
app.use("/message", authMiddleware, messageRouter);

app.use(ErrorHandler);

httpServer.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

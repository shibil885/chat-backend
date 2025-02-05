import express, { NextFunction, Request, Response } from "express";
import OtpController from "../../controllers/otp/otp.controller";

const router = express.Router();
const otpController = new OtpController();

router.post("/submit", (req: Request, res: Response, next: NextFunction) => {
  otpController.submit(req, res, next);
});

export default router;

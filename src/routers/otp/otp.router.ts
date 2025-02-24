import express, { NextFunction, Request, Response } from "express";
import OtpController from "../../controllers/otp/otp.controller";
import OtpService from "../../services/otp/otp.service";
import { IOtpRepository } from "../../interfaces/otp/otpRepository.interface";
import OtpRepository from "../../repositories/otp/otp.repository";
import { IUserRepository } from "../../interfaces/user/userRepository.interface";
import UserRepository from "../../repositories/user/user.repository";
import { TokenGenerator } from "../../util/tokenGenerator.util";

const router = express.Router();

const otpRepository: IOtpRepository = new OtpRepository();
const userRepository: IUserRepository = new UserRepository();
const tokenGenerator: TokenGenerator = new TokenGenerator();
const otpService = new OtpService(
  otpRepository,
  userRepository,
  tokenGenerator
);
const otpController = new OtpController(otpService);

router.patch("/submit", (req: Request, res: Response, next: NextFunction) => {
  otpController.submit(req, res, next);
});

export default router;

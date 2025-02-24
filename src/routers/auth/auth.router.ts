  import express, { NextFunction, Request, Response } from "express";
  import AuthController from "../../controllers/user/auth.controller";
  import AuthService from "../../services/auth/auth.service";
  import { IUserRepository } from "../../interfaces/user/userRepository.interface";
  import UserRepository from "../../repositories/user/user.repository";
  import { IOtpRepository } from "../../interfaces/otp/otpRepository.interface";
  import OtpRepository from "../../repositories/otp/otp.repository";
  import { TokenGenerator } from "../../util/tokenGenerator.util";

  const router = express.Router();
  const userRepository: IUserRepository = new UserRepository();
  const otpRepository: IOtpRepository = new OtpRepository();
  const jwtTokenGenerator: TokenGenerator = new TokenGenerator();
  const authService = new AuthService(
    userRepository,
    otpRepository,  
    jwtTokenGenerator
  );
  const authController = new AuthController(authService);

  router.post("/login", (req: Request, res: Response, next: NextFunction) => {
    authController.login(req, res, next);
  });

  router.post("/register", (req: Request, res: Response, next: NextFunction) => {
    authController.registration(req, res, next);
  });

  export default router;

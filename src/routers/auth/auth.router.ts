import express, { NextFunction, Request, Response } from "express";
import AuthController from "../../controllers/user/auth.controller";

const router = express.Router();
const authController = new AuthController();

router.post("/login", (req: Request, res: Response, next: NextFunction) => {
  authController.login(req, res, next);
});

router.post(
  "/registration",
  (req: Request, res: Response, next: NextFunction) => {
    authController.registration(req, res, next);
  }
);

export default router;

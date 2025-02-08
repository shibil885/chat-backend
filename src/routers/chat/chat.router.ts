import express, { NextFunction, Request, Response } from "express";
import ChatController from "../../controllers/chat/chat.controller";

const router = express.Router();
const chatController = new ChatController();

router.get("/newUsers", (req: Request, res: Response, next: NextFunction) => {
  chatController.newUsers(req, res, next);
});

router.get("/getAllChat", (req: Request, res: Response, next: NextFunction) => {
  chatController.getAllChats(req, res, next);
});

router.post(
  "/getOrCreate/:receiverId",
  (req: Request, res: Response, next: NextFunction) => {
    chatController.createOrGetOneOnOneChat(req, res, next);
  }
);

export default router;

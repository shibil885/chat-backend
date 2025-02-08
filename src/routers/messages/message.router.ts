import express, { NextFunction, Request, Response } from "express";
import MessageController from "../../controllers/messages/message.controller";

const router = express.Router();
const messageController = new MessageController();

router.post("/addmessage/:chatId", (req: Request, res: Response, next: NextFunction) => {
  messageController.addNewMessage(req, res, next);
});

router.get("/messages/:chatId", (req: Request, res: Response, next: NextFunction) => {
  messageController.getAllMessages(req, res, next);
});

export default router;

import express, { NextFunction, Request, Response } from "express";
import MessageController from "../../controllers/messages/message.controller";
import multer from "multer";
const router = express.Router();
const messageController = new MessageController();
const upload = multer({ storage: multer.memoryStorage() });
router.post(
  "/addmessage/:chatId",
  multer().single("attachment"),
  (req: Request, res: Response, next: NextFunction) => {
    messageController.addNewMessage(req, res, next);
  }
);

router.get(
  "/messages/:chatId",
  (req: Request, res: Response, next: NextFunction) => {
    messageController.getAllMessages(req, res, next);
  }
);

export default router;

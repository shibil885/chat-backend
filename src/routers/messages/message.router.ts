import express, { NextFunction, Request, Response } from "express";
import MessageController from "../../controllers/messages/message.controller";
import multer from "multer";
import MessageService from "../../services/messages/message.service";
import { IMessageRepository } from "../../interfaces/messages/messageRepository.interface";
import MessageRepository from "../../repositories/messages/message.repository";
import { IChatRepository } from "../../interfaces/chat/chatRepository.interface";
import ChatRepository from "../../repositories/chat/chat.repository";
const router = express.Router();

const messageRepository: IMessageRepository = new MessageRepository();
const chatRepository: IChatRepository = new ChatRepository();

const messageService = new MessageService(messageRepository, chatRepository);
const messageController = new MessageController(messageService);
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

router.patch(
  "/readallmessages/:chatId",
  (req: Request, res: Response, next: NextFunction) => {
    messageController.readAllMessages(req, res, next);
  }
);

export default router;

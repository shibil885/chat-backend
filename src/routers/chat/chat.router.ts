import express, { NextFunction, Request, Response } from "express";
import { ChatController } from "../../controllers/chat/chat.controller";
import ChatService from "../../services/chat/chat.service";
import ChatRepository from "../../repositories/chat/chat.repository";
import { IChatRepository } from "../../interfaces/chat/chatRepository.interface";
import { IUserRepository } from "../../interfaces/user/userRepository.interface";
import UserRepository from "../../repositories/user/user.repository";

const router = express.Router();
const chatRepository: IChatRepository = new ChatRepository();
const userRepository: IUserRepository = new UserRepository();
const chatService = new ChatService(chatRepository, userRepository);
const chatController = new ChatController(chatService);


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

router.post(
  "/creategroupchat",
  (req: Request, res: Response, next: NextFunction) => {
    chatController.createNewGroup(req, res, next);
  }
);

router.get(
  "/getgroupchat/:chatId",
  (req: Request, res: Response, next: NextFunction) => {
    chatController.getAGroupChat(req, res, next);
  }
);

router.get(
  "/:chatId/non-participants",
  (req: Request, res: Response, next: NextFunction) => {
    chatController.getNonParticipants(req, res, next);
  }
);

router.post(
  "/:chatId/add-users",
  (req: Request, res: Response, next: NextFunction) => {
    chatController.addUsersToChat(req, res, next);
  }
);

router.patch(
  "/leave-chat/:chatId",
  (req: Request, res: Response, next: NextFunction) => {
    chatController.leaveChat(req, res, next);
  }
);

export default router;

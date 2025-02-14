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

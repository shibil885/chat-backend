import { NextFunction, Request, Response } from "express";
import { IUser } from "../../interfaces/user/user.inerface";
import ChatService from "../../services/chat/chat.service";
import ApiResponse from "../../util/response.util";
import { SuccessMessage } from "../../enums/successMessage.enum";
import HttpStatusCode from "../../enums/httpStatus.enum";
import { AuthRequest } from "../../interfaces/decodedJwt.interface";
import { ErrorMessage } from "../../enums/errorMessage.enum";
import { Types } from "mongoose";
import IChat from "../../interfaces/chat/chat.interface";
import SocketService from "../../services/socket/socket.service";
import { ChatEventEnum } from "../../enums/socketEvent.enum";

export class ChatController {
  constructor(private _chatService: ChatService) {}

  async newUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      let currentUserId = req.user?._id;
      if (!currentUserId) {
        throw new Error(
          JSON.stringify(
            ApiResponse.errorResponse(
              ErrorMessage.UNAUTHORIZED_ACCESS,
              null,
              HttpStatusCode.UNAUTHORIZED
            )
          )
        );
      }
      const users: IUser[] = await this._chatService.newUsers(currentUserId);
      const response = ApiResponse.successResponse<IUser[]>(
        SuccessMessage.NEW_USERS,
        users,
        HttpStatusCode.OK
      );
      return res.status(HttpStatusCode.OK).json(response);
    } catch (error) {
      return next(error);
    }
  }

  async getAllChats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const chats = await this._chatService.getAllChats(
        new Types.ObjectId(req.user?._id)
      );
      const response = ApiResponse.successResponse<IChat[]>(
        SuccessMessage.ALL_CHAT_FETCHED,
        chats,
        HttpStatusCode.OK
      );
      return res.status(HttpStatusCode.OK).json(response);
    } catch (error) {
      return next(error);
    }
  }

  async createOrGetOneOnOneChat(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { receiverId } = req.params;
      const { chat, newChat } =
        await this._chatService.getOrCreateAOneOnOneChat(
          new Types.ObjectId(req.user?._id),
          new Types.ObjectId(receiverId)
        );
      const userId = req.user?._id.toString();
      if (chat) {
        if (newChat && userId) {
          chat.participants.forEach((participant) => {
            if (participant._id == req.user?._id) return;
            SocketService.emitSocketEvent(
              req,
              userId,
              ChatEventEnum.NEW_CHAT_EVENT,
              chat
            );
          });
        }
        const response = ApiResponse.successResponse<IChat>(
          SuccessMessage.CHAT_CREATED,
          chat,
          HttpStatusCode.OK
        );
        return res.status(HttpStatusCode.OK).json(response);
      } else {
        const errorResponse = ApiResponse.errorResponse(
          ErrorMessage.INTERNAL_SERVER_ERROR,
          null,
          HttpStatusCode.INTERNAL_SERVER_ERROR
        );
        throw new Error(JSON.stringify(errorResponse));
      }
    } catch (error) {
      return next(error);
    }
  }

  async getAGroupChat(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { chatId } = req.params;
      const groupChat = await this._chatService.getAGroupChat(
        new Types.ObjectId(chatId),
        new Types.ObjectId(req.user?._id)
      );
      if (groupChat) {
        return res
          .status(HttpStatusCode.OK)
          .json(
            ApiResponse.successResponse<IChat>(
              SuccessMessage.FETCHED_MESSAGES,
              groupChat,
              HttpStatusCode.OK
            )
          );
      }
    } catch (error) {
      return next(error);
    }
  }

  async createNewGroup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name, participants } = req.body;
      const currentUser = req.user?._id;
      const newGroup = await this._chatService.createNewGroupChat(
        name,
        participants,
        new Types.ObjectId(currentUser)
      );
      if (newGroup && req.user?._id) {
        participants.forEach((participant: IUser) => {
          if (participant._id.toString() == req.user?._id.toString()) return;
          SocketService.emitSocketEvent(
            req,
            participant._id.toString(),
            ChatEventEnum.NEW_GROUP_CREATED,
            newGroup
          );
        });
        return res
          .status(HttpStatusCode.CREATED)
          .json(
            ApiResponse.successResponse(
              SuccessMessage.CHAT_CREATED,
              null,
              HttpStatusCode.CREATED
            )
          );
      }
    } catch (error) {
      return next(error);
    }
  }

  async getNonParticipants(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { chatId } = req.params;
      const users = await this._chatService.getNonParticipants(chatId);
      return res
        .status(HttpStatusCode.OK)
        .json(
          ApiResponse.successResponse(
            SuccessMessage.USERS_LIST,
            users,
            HttpStatusCode.OK
          )
        );
    } catch (error) {
      return next(error);
    }
  }

  async addUsersToChat(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { chatId } = req.params;
      const { userIds } = req.body;

      const updatedChat = await this._chatService.addUsersToChat(
        chatId,
        userIds
      );
      userIds.forEach((id: string) => {
        SocketService.emitSocketEvent(
          req,
          id,
          ChatEventEnum.NEW_GROUP_CREATED,
          updatedChat
        );
      });
      return res
        .status(HttpStatusCode.OK)
        .json(
          ApiResponse.successResponse(
            "Users added successfully!",
            updatedChat,
            HttpStatusCode.OK
          )
        );
    } catch (error: any) {
      return next(error);
    }
  }

  async leaveChat(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { chatId } = req.params;
      const userId = req.body.userId;

      const result = await this._chatService.leaveChat(chatId, userId);

      res
        .status(HttpStatusCode.OK)
        .json(
          ApiResponse.successResponse(
            "Left chat successfully",
            result,
            HttpStatusCode.OK
          )
        );
    } catch (error) {
      return next(error);
    }
  }
}

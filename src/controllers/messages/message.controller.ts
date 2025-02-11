import { NextFunction, Response } from "express";
import { AuthRequest } from "../../interfaces/decodedJwt.interface";
import MessageService from "../../services/messages/message.service";
import { Types } from "mongoose";
import ApiResponse from "../../util/response.util";
import { ErrorMessage } from "../../enums/errorMessage.enum";
import HttpStatusCode from "../../enums/httpStatus.enum";
import { SuccessMessage } from "../../enums/successMessage.enum";
import SocketService from "../../services/socket/socket.service";
import { ChatEventEnum } from "../../enums/socketEvent.enum";
import { IUser } from "../../interfaces/user/user.inerface";

export default class MessageController {
  private _messageService: MessageService;
  constructor() {
    this._messageService = new MessageService();
  }

  async addNewMessage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { chatId } = req.params;
      const { content, fileType } = req.body;

      if (!chatId && content && req.file) {
        throw new Error(
          JSON.stringify(
            ApiResponse.errorResponse(
              ErrorMessage.MESSAGE_SEND_FAILED,
              null,
              HttpStatusCode.BAD_REQUEST
            )
          )
        );
      }
      const { messages, participants } = await this._messageService.addMessage(
        new Types.ObjectId(req.user?._id),
        new Types.ObjectId(chatId),
        content,
        req.file,
        req.file?.mimetype,
        fileType
      );
      console.log('mmessage', messages);
      
      if (messages && req.user?._id) {
        participants.forEach((participant) => {
          if (participant._id.toString() == req.user?._id.toString()) return;
          SocketService.emitSocketEvent(
            req,
            participant._id.toString(),
            ChatEventEnum.MESSAGE_RECEIVED_EVENT,
            messages,
          );
        });
        return res
          .status(HttpStatusCode.CREATED)
          .json(
            ApiResponse.successResponse(
              SuccessMessage.MESSAGE_SENT,
              messages,
              HttpStatusCode.CREATED
            )
          );
      } else {
        throw new Error(
          JSON.stringify(
            ApiResponse.errorResponse(
              ErrorMessage.INTERNAL_SERVER_ERROR,
              null,
              HttpStatusCode.INTERNAL_SERVER_ERROR
            )
          )
        );
      }
    } catch (error) {
      return next(error);
    }
  }

  async getAllMessages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { chatId } = req.params;
      if (!chatId)
        throw new Error(
          JSON.stringify(
            ApiResponse.errorResponse(
              ErrorMessage.CHAT_NOT_FOUND,
              null,
              HttpStatusCode.BAD_REQUEST
            )
          )
        );
      const messages = await this._messageService.getAllMessages(
        new Types.ObjectId(chatId),
        req.user?._id
      );
      return res
        .status(HttpStatusCode.OK)
        .json(
          ApiResponse.successResponse(
            SuccessMessage.FETCHED_MESSAGES,
            messages,
            HttpStatusCode.OK
          )
        );
    } catch (error) {
      return next(error);
    }
  }
}

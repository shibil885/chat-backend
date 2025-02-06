import { NextFunction, Request, Response } from "express";
import { IUser } from "../../interfaces/user/user.inerface";
import ChatService from "../../services/chat/chat.service";
import ApiResponse from "../../util/response.util";
import { SuccessMessage } from "../../enums/successMessage.enum";
import HttpStatusCode from "../../enums/httpStatus.enum";
import { AuthRequest } from "../../interfaces/decodedJwt.interface";
import { ErrorMessage } from "../../enums/errorMessage.enum";

export default class ChatController {
  private _chatService: ChatService;
  constructor() {
    this._chatService = new ChatService();
  }

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
}

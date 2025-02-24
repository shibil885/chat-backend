import { Types } from "mongoose";
import ApiResponse from "../../util/response.util";
import { ErrorMessage } from "../../enums/errorMessage.enum";
import HttpStatusCode from "../../enums/httpStatus.enum";
import { IUser } from "../../interfaces/user/user.inerface";
import IChat from "../../interfaces/chat/chat.interface";
import { IChatRepository } from "../../interfaces/chat/chatRepository.interface";
import { IUserRepository } from "../../interfaces/user/userRepository.interface";

export default class ChatService {
  constructor(
    private _chatRepository: IChatRepository,
    private _userRepository: IUserRepository
  ) {}

  async newUsers(userId: Types.ObjectId) {
    try {
      const newUsers = await this._userRepository.newUsers(userId);
      return newUsers;
    } catch (error) {
      throw error;
    }
  }

  async getAllChats(userId: Types.ObjectId) {
    try {
      const chats = await this._chatRepository.getAllChat(userId);
      return chats.filter((chat) =>
        chat.lastMessage ? chat.lastMessage?.length : 0 || chat.isGroupChat
      );
    } catch (error) {
      throw error;
    }
  }

  async getOrCreateAOneOnOneChat(
    userId: Types.ObjectId,
    receiverId: Types.ObjectId
  ): Promise<{
    chat: IChat;
    newChat: Boolean;
  }> {
    try {
      const isRecieverExist = await this._userRepository.findById(receiverId);
      if (!isRecieverExist) {
        throw new Error(
          JSON.stringify(
            ApiResponse.errorResponse(
              ErrorMessage.USER_NOT_FOUND,
              null,
              HttpStatusCode.NOT_FOUND
            )
          )
        );
      }
      const newOrExistChat =
        await this._chatRepository.createOrGetAOneOnOneChat(userId, receiverId);
      return newOrExistChat;
    } catch (error) {
      throw error;
    }
  }

  async getAGroupChat(chatId: Types.ObjectId, userId: Types.ObjectId) {
    const chat = await this._chatRepository.findById(chatId);
    if (!chat)
      throw new Error(
        JSON.stringify(
          ApiResponse.errorResponse(
            ErrorMessage.CHAT_NOT_FOUND,
            null,
            HttpStatusCode.NOT_FOUND
          )
        )
      );

    const groupChat = await this._chatRepository.getAGroupChat(chatId, userId);
    return groupChat[0];
  }

  async createNewGroupChat(
    name: string,
    participants: IUser[],
    userId: Types.ObjectId
  ) {
    if (!name || !participants.length) {
      throw new Error(
        JSON.stringify(
          ApiResponse.errorResponse(
            ErrorMessage.GROUP_CREATION_FAILD,
            null,
            HttpStatusCode.BAD_REQUEST
          )
        )
      );
    }

    const newGroup = await this._chatRepository.createGroupChat(
      name,
      participants,
      userId
    );
    return newGroup;
  }

  async getNonParticipants(chatId: string) {
    try {
      return this._chatRepository.getNonParticipants(
        new Types.ObjectId(chatId)
      );
    } catch (error) {
      throw error;
    }
  }

  async addUsersToChat(chatId: string, userIds: string[]) {
    if (!userIds || userIds.length === 0) {
      throw new Error(
        JSON.stringify(
          ApiResponse.errorResponse(
            "No users provided!",
            null,
            HttpStatusCode.NOT_FOUND
          )
        )
      );
    }
    return await this._chatRepository.addUsersToChat(
      new Types.ObjectId(chatId),
      userIds.map((user) => new Types.ObjectId(user))
    );
  }

  async leaveChat(chatId: string, userId: string) {
    return await this._chatRepository.leaveChat(
      new Types.ObjectId(chatId),
      new Types.ObjectId(userId)
    );
  }
}

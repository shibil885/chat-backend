import { Types } from "mongoose";
import ChatRepository from "../../repositories/chat/chat.repository";
import UserRepository from "../../repositories/user/user.repository";
import ApiResponse from "../../util/response.util";
import { ErrorMessage } from "../../enums/errorMessage.enum";
import HttpStatusCode from "../../enums/httpStatus.enum";
import { IUser } from "../../interfaces/user/user.inerface";
import IChat from "../../interfaces/chat/chat.interface";

export default class ChatService {
  private _chatRepository: ChatRepository;
  private _userRepository: UserRepository;

  constructor() {
    this._chatRepository = new ChatRepository();
    this._userRepository = new UserRepository();
  }

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
      return chats.filter(
        (chat) => chat.lastMessage.length || chat.isGroupChat
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
}

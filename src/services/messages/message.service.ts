import { Types } from "mongoose";
import MessageRepository from "../../repositories/messages/message.repository";
import ChatRepository from "../../repositories/chat/chat.repository";
import ApiResponse from "../../util/response.util";
import { ErrorMessage } from "../../enums/errorMessage.enum";
import HttpStatusCode from "../../enums/httpStatus.enum";

export default class MessageService {
  private _messageRepository: MessageRepository;
  private _chatRepository: ChatRepository;
  constructor() {
    this._messageRepository = new MessageRepository();
    this._chatRepository = new ChatRepository();
  }

  async addMessage(
    senderId: Types.ObjectId,
    chatId: Types.ObjectId,
    content: string
  ) {
    try {
      const isExisting = await this._chatRepository.findById(chatId);
      if (!isExisting) {
        throw new Error(
          JSON.stringify(
            ApiResponse.errorResponse(
              ErrorMessage.CHAT_NOT_FOUND,
              null,
              HttpStatusCode.NOT_FOUND
            )
          )
        );
      }

      const newMessage = await this._messageRepository.addMessage(
        senderId,
        chatId,
        content
      );

      const updateLastMessage = await this._chatRepository.updateLastMessage(
        chatId,
        newMessage._id
      );

      return updateLastMessage;
    } catch (error) {
      throw error;
    }
  }

  async getAllMessages(chatId: Types.ObjectId, userId?: Types.ObjectId) {
    const selectedChat = this._chatRepository.findById(chatId);
    if (!selectedChat)
      throw new Error(
        JSON.stringify(
          ApiResponse.errorResponse(
            ErrorMessage.CHAT_NOT_FOUND,
            null,
            HttpStatusCode.NOT_FOUND
          )
        )
      );
      const messages = await this._messageRepository.getAllMessages(chatId, userId)
      return messages.length ? messages : [];
  }
}

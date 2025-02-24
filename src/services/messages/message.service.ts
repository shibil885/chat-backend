import { Types } from "mongoose";
import ApiResponse from "../../util/response.util";
import { ErrorMessage } from "../../enums/errorMessage.enum";
import HttpStatusCode from "../../enums/httpStatus.enum";
import s3BucketFileUploader from "../../util/s3BucketUploader.util";
import { IMessageRepository } from "../../interfaces/messages/messageRepository.interface";
import { IChatRepository } from "../../interfaces/chat/chatRepository.interface";

export default class MessageService {
  constructor(
    private _messageRepository: IMessageRepository,
    private _chatRepository: IChatRepository
  ) {}

  async addMessage(
    senderId: Types.ObjectId,
    chatId: Types.ObjectId,
    content: string,
    attachment?: Express.Multer.File,
    fileType?: string,
    selectedFileType: string = ""
  ) {
    try {
      let url = "";
      let name = "";

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

      if (attachment) {
        if (!fileType) {
          throw new Error(
            JSON.stringify(
              ApiResponse.errorResponse(
                ErrorMessage.FAILED_UPLOADS,
                "File type is required",
                HttpStatusCode.BAD_REQUEST
              )
            )
          );
        }
        url = await s3BucketFileUploader(
          attachment.originalname,
          attachment.buffer,
          fileType
        );
        name = attachment.originalname;
      }

      const newMessage = await this._messageRepository.addMessage(
        senderId,
        chatId,
        content,
        url,
        name,
        selectedFileType
      );
      if (newMessage._id)
        await this._chatRepository.updateLastMessage(chatId, newMessage._id);
      else
        throw new Error(
          JSON.stringify(
            ApiResponse.errorResponse(
              ErrorMessage.MESSAGE_SEND_FAILED,
              null,
              HttpStatusCode.BAD_REQUEST
            )
          )
        );
      return {
        messages: newMessage,
        participants: isExisting.participants,
      };
    } catch (error) {
      console.error("Error in addMessage:", error);
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
    const messages = await this._messageRepository.getAllMessages(
      chatId,
      userId
    );
    return messages.length ? messages : [];
  }

  async readAllMessages(userId: Types.ObjectId, chatId: Types.ObjectId) {
    const isChatExist = await this._chatRepository.findById(chatId);

    if (!isChatExist) {
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
    await this._messageRepository.readAllMessages(chatId, userId);
    return isChatExist;
  }
}

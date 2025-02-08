import { Types } from "mongoose";
import MessageModel from "../../models/message.model";

export default class MessageRepository {
  async addMessage(
    senderId: Types.ObjectId,
    chatId: Types.ObjectId,
    content: string
  ) {
    const newMessage = MessageModel.create({
      sender: senderId,
      content: content || "",
      chat: chatId,
    });
    return newMessage;
  }

  async getAllMessages(chatId: Types.ObjectId, userId?: Types.ObjectId) {
    const messages = await MessageModel.aggregate([
      {
        $match: { chat: chatId },
      },
      {
        $sort: { createdAt: 1 },
      },
      {
        $addFields: {'loggeduser': userId}
      }
    ]);
    return messages;
  }
}

import { Types } from "mongoose";
import MessageModel from "../../models/message.model";

export default class MessageRepository {
  async addMessage(
    senderId: Types.ObjectId,
    chatId: Types.ObjectId,
    content: string,
    url: string,
    name: string,
    selectedFileType: string
  ) {
    const newMessage = MessageModel.create({
      sender: senderId,
      content: content || "",
      chat: chatId,
      attachments: { url: url, fileName: name, fileType: selectedFileType },
    });
    return newMessage;
  }

  async getAllMessages(chatId: Types.ObjectId, userId?: Types.ObjectId) {
    const messages = await MessageModel.aggregate([
      {
        $match: { chat: chatId },
      },
      {
        $lookup: {
          from: "users",
          foreignField: "_id",
          localField: "sender",
          as: "sender",
          pipeline: [
            {
              $project: {
                username: 1,
                avatar: 1,
                email: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          sender: { $first: "$sender" },
        },
      },
      {
        $addFields: { loggeduser: userId },
      },
      {
        $sort: { createdAt: 1 },
      },
    ]);
    return messages;
  }

  async readAllMessages(chatId: Types.ObjectId, userId: Types.ObjectId) {
    return await MessageModel.updateMany(
      { chat: chatId, sender: { $ne: userId } },
      { isRead: true }
    );
  }
}

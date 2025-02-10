import { Types } from "mongoose";
import ChatModel from "../../models/chat.model";
import IChat from "../../interfaces/chat/chat.interface";
import { IUser } from "../../interfaces/user/user.inerface";
export default class ChatRepository {
  constructor() {}

  async getAllChat(userId: Types.ObjectId) {
    const chats = await ChatModel.aggregate([
      {
        $match: {
          participants: { $elemMatch: { $eq: userId } },
        },
      },
      {
        $lookup: {
          from: "users",
          foreignField: "_id",
          localField: "participants",
          as: "participants",
          pipeline: [
            {
              $project: {
                password: 0,
              },
            },
          ],
        },
      },
      {
        $addFields: { loggeduser: userId },
      },
      {
        $lookup: {
          from: "chatmessages",
          foreignField: "_id",
          localField: "lastMessage",
          as: "lastMessage",
          pipeline: [
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
          ],
        },
      },
      {
        $sort: {
          updatedAt: -1,
        },
      },
    ]);
    return chats;
  }

  async createOrGetAOneOnOneChat(
    userId: Types.ObjectId,
    receiverId: Types.ObjectId
  ): Promise<IChat> {
    const chat: IChat[] = await ChatModel.aggregate([
      {
        $match: {
          isGroupChat: false,
          $and: [
            {
              participants: { $elemMatch: { $eq: userId } },
            },
            {
              participants: {
                $elemMatch: { $eq: receiverId },
              },
            },
          ],
        },
      },
      {
        $addFields: { loggeduser: userId },
      },
      {
        $lookup: {
          from: "users",
          foreignField: "_id",
          localField: "participants",
          as: "participants",
          pipeline: [
            {
              $project: {
                password: 0,
              },
            },
          ],
        },
      },
    ]);

    if (chat.length) {
      return chat[0];
    }
    const newChatInstance = await ChatModel.create({
      name: "One on one chat",
      participants: [userId, receiverId],
      admin: userId,
    });
    const createdChat = await ChatModel.aggregate([
      {
        $match: {
          _id: newChatInstance._id,
        },
      },
      {
        $lookup: {
          from: "users",
          foreignField: "_id",
          localField: "participants",
          as: "participants",
          pipeline: [
            {
              $project: {
                password: 0,
              },
            },
          ],
        },
      },
      {
        $addFields: { loggeduser: userId },
      },
    ]);
    return createdChat[0];
  }

  async getAGroupChat(chatId: Types.ObjectId, userId: Types.ObjectId) {
    return await ChatModel.aggregate([
      {
        $match: { _id: chatId },
      },
      {
        $lookup: {
          from: "users",
          foreignField: "_id",
          localField: "participants",
          as: "participants",
          pipeline: [
            {
              $project: {
                password: 0,
              },
            },
          ],
        },
      },
      {
        $addFields: { loggeduser: userId },
      },
      {
        $lookup: {
          from: "chatmessages",
          foreignField: "_id",
          localField: "lastMessage",
          as: "lastMessage",
          pipeline: [
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
          ],
        },
      },
      {
        $sort: {
          updatedAt: -1,
        },
      },
    ]);
  }

  async findById(chatId: Types.ObjectId) {
    return await ChatModel.findById(chatId);
  }

  async updateLastMessage(chatId: Types.ObjectId, messageId: Types.ObjectId) {
    const updateResult = await ChatModel.findOneAndUpdate(
      { _id: chatId },
      { lastMessage: messageId }
    );
    return updateResult;
  }

  async createGroupChat(
    name: string,
    participants: IUser[],
    userId: Types.ObjectId
  ) {
    let newGroupChat = await new ChatModel({
      admin: userId,
      isGroupChat: true,
      participants: [...participants, userId],
      name: name,
    }).save();
    return newGroupChat;
  }
}

import { Types } from "mongoose";
import ChatModel from "../../models/chat.model";
import IChat from "../../interfaces/chat/chat.interface";
import { IUser } from "../../interfaces/user/user.inerface";
import UserModel from "../../models/user.model";
import ApiResponse from "../../util/response.util";
import HttpStatusCode from "../../enums/httpStatus.enum";
import { IChatRepository } from "../../interfaces/chat/chatRepository.interface";
export default class ChatRepository implements IChatRepository {
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
        $lookup: {
          from: "chatmessages",
          foreignField: "chat",
          localField: "_id",
          as: "unreadMessages",
          pipeline: [
            { $match: { sender: { $ne: userId }, isRead: false } },
            {
              $project: {
                attachments: 0,
                chat: 0,
                content: 0,
                isRead: 0,
                createdAt: 0,
                updatedAt: 0,
                sender: 0,
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
  ): Promise<{ chat: IChat; newChat: boolean }> {
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
      {
        $lookup: {
          from: "chatmessages",
          foreignField: "_id",
          localField: "lastMessage",
          as: "lastMessage",
        },
      },
    ]);

    if (chat.length) {
      return { chat: chat[0], newChat: false };
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
    return { chat: createdChat[0], newChat: true };
  }

  async getAGroupChat(
    chatId: Types.ObjectId,
    userId: Types.ObjectId
  ): Promise<IChat[]> {
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

  async findById(chatId: Types.ObjectId): Promise<IChat | null> {
    return await ChatModel.findById(chatId);
  }

  async updateLastMessage(chatId: Types.ObjectId, messageId: Types.ObjectId) {
    const updateResult = await ChatModel.findOneAndUpdate(
      { _id: chatId },
      { lastMessage: messageId }
    );
    return updateResult as IChat;
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
    return newGroupChat as IChat;
  }

  async getNonParticipants(chatId: Types.ObjectId) {
    try {
      const chat = await ChatModel.findById(chatId).populate(
        "participants",
        "_id"
      );
      if (!chat) return [];

      const participantIds = chat.participants.map((user) => user._id);

      const nonParticipants = await UserModel.find({
        _id: { $nin: participantIds },
      }).select("_id username email");
      return nonParticipants;
    } catch (error) {
      throw error;
    }
  }

  async addUsersToChat(
    chatId: Types.ObjectId,
    userIds: Types.ObjectId[]
  ): Promise<IChat | null> {
    return (await ChatModel.findByIdAndUpdate(
      chatId,
      { $addToSet: { participants: { $each: userIds } } },
      { new: true }
    ).populate("participants", "username email")) as IChat;
  }

  async leaveChat(chatId: Types.ObjectId, userId: Types.ObjectId) {
    const chat = await ChatModel.findById(chatId);
    if (!chat)
      throw new Error(
        JSON.stringify(
          ApiResponse.errorResponse(
            "Chat not found",
            null,
            HttpStatusCode.NOT_FOUND
          )
        )
      );

    chat.participants = chat.participants.filter(
      (participant) => participant.toString() !== userId.toString()
    );

    if (chat.admin === userId) {
      if (chat.participants.length > 0) {
        chat.admin = chat.participants[0];
      } else {
        await ChatModel.findByIdAndDelete(chatId);
        return true;
      }
    }

    await chat.save();
    return chat as IChat;
  }
}

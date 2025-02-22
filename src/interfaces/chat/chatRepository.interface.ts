import { Types } from "mongoose";
import IChat from "./chat.interface";
import { IUser } from "../user/user.inerface";

export interface IChatRepository {
  getAllChat(userId: Types.ObjectId): Promise<IChat[]>;

  createOrGetAOneOnOneChat(
    userId: Types.ObjectId,
    receiverId: Types.ObjectId
  ): Promise<{ chat: IChat; newChat: boolean }>;

  getAGroupChat(chatId: Types.ObjectId, userId: Types.ObjectId): Promise<IChat[]>;

  findById(chatId: Types.ObjectId): Promise<IChat | null>;

  updateLastMessage(
    chatId: Types.ObjectId,
    messageId: Types.ObjectId
  ): Promise<IChat | null>;

  createGroupChat(
    name: string,
    participants: IUser[],
    userId: Types.ObjectId
  ): Promise<IChat>;

  getNonParticipants(chatId: Types.ObjectId): Promise<IUser[]>;

  addUsersToChat(
    chatId: Types.ObjectId,
    userIds: Types.ObjectId[]
  ): Promise<IChat | null>;

  leaveChat(
    chatId: Types.ObjectId,
    userId: Types.ObjectId
  ): Promise<IChat | boolean>;
}

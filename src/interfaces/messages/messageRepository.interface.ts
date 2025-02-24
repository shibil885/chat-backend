import { Types, UpdateWriteOpResult } from "mongoose";
import { IMessage } from "./message.interface";

export interface IMessageRepository {
  addMessage(
    senderId: Types.ObjectId,
    chatId: Types.ObjectId,
    content: string,
    url: string,
    name: string,
    selectedFileType: string
  ): Promise<IMessage>;

  getAllMessages(
    chatId: Types.ObjectId,
    userId?: Types.ObjectId
  ): Promise<IMessage[]>;

  readAllMessages(
    chatId: Types.ObjectId,
    userId: Types.ObjectId
  ): Promise<UpdateWriteOpResult>;
}

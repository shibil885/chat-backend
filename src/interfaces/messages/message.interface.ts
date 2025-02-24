import { Types } from "mongoose";

export interface IMessage {
  _id?: Types.ObjectId;
  sender: Types.ObjectId;
  content: string;
  attachments: {
    fileName: string;
    url: string;
    fileType: string;
  };
  chat: Types.ObjectId;
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

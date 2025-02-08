import { Types } from "mongoose";

export default interface IChat {
  _id: Types.ObjectId;
  name: string;
  isGroupChat: boolean;
  lastMessage?: string;
  participants: Types.ObjectId[];
  admin?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

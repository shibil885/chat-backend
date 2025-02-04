import { Types } from "mongoose";

export interface IUser  {
  _id: string;
  username: string;
  email: string;
  password: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: Date;
  socketId: string | null;
  friends: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

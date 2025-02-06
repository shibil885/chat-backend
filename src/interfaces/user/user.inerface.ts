import { Types } from "mongoose";

export interface IUser {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: Date;
  socketId: string | null;
  isVerified: boolean;
  friends: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

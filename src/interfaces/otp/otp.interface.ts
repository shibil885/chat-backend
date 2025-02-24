import { Types } from "mongoose";

export interface IOtp {
  _id?: Types.ObjectId;
  email: string;
  otp: number;
  createdAt?: Date;
  updatedAt?: Date;
}

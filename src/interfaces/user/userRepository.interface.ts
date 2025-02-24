import { Types } from "mongoose";
import { IUser } from "./user.inerface";

export interface IUserRepository {
  registerUser(
    email: string,
    password: string,
    username: string
  ): Promise<IUser>;
  findOne(email: string): Promise<IUser | null>;
  userVerified(email: string): Promise<IUser | null>;
  newUsers(userId: Types.ObjectId): Promise<IUser[]>;
  findById(userId: Types.ObjectId): Promise<IUser | null>;
}

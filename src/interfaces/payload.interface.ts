import { Types } from 'mongoose';

export interface IPayload {
  _id: Types.ObjectId;
  email: string;
}
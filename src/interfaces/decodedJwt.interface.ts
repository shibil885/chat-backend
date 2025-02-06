import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";

export interface AuthRequest extends Request {
  user?: JwtPayload & {
    _id: Types.ObjectId;
    email: string;
  };
}

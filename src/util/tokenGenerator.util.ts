import { IPayload } from "../interfaces/payload.interface";
import * as jwt from "jsonwebtoken";

export class TokenGenerator {
  generateAccessToken(payload: IPayload): string {
    console.log(process.env.SECRET_KEY);
    
    return jwt.sign(payload, process.env.SECRET_KEY as string, {
      expiresIn: "15m",
    });
  }

  generateRefreshToken(payload: IPayload): string {
    return jwt.sign(payload, process.env.SECRET_KEY as string, {
      expiresIn: "7d",
    });
  }
}

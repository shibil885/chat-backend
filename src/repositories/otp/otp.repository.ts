import { ErrorMessage } from "../../enums/errorMessage.enum";
import OtpModel from "../../models/otp.model";

export default class OtpRepository {
  async create(email: string) {
    try {
      const otp = Math.floor(1000 + Math.random() * 9000);
      await OtpModel.deleteMany({ email });
      return await new OtpModel({
        email,
        otp,
        expiresAt: 60,
      }).save();
    } catch (error) {
      throw new Error(ErrorMessage.OTP_CREATION_FAILED);
    }
  }
}

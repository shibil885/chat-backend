import { ErrorMessage } from "../../enums/errorMessage.enum";
import HttpStatusCode from "../../enums/httpStatus.enum";
import OtpRepository from "../../repositories/otp/otp.repository";
import UserRepository from "../../repositories/user/user.repository";
import ApiResponse from "../../util/response.util";
import { TokenGenerator } from "../../util/tokenGenerator.util";

export default class OtpService {
  private _otpRepository: OtpRepository;
  private _userRepository: UserRepository;
  private _tokenGenerator: TokenGenerator;
  constructor() {
    this._otpRepository = new OtpRepository();
    this._userRepository = new UserRepository();
    this._tokenGenerator = new TokenGenerator();
  }

  async otpSubmit(email: string, otp: string) {
    const isMatched = await this._otpRepository.submit(email, +otp);
    if (isMatched) {
      const userData = await this._userRepository.findOne(email);
      if (userData) {

        const access_token = this._tokenGenerator.generateAccessToken({
          email: userData.email,
          _id: userData._id,
        });

        const refresh_token = this._tokenGenerator.generateRefreshToken({
          email: userData.email,
          _id: userData._id,
        });

        return {
          access_token,
          refresh_token,
        };
        
      } else {
        const errorResponse = ApiResponse.errorResponse(
          ErrorMessage.USER_NOT_FOUND,
          null,
          HttpStatusCode.NOT_FOUND
        );
        throw new Error(JSON.stringify(errorResponse));
      }
    } else {
      const errorResponse = ApiResponse.errorResponse(
        ErrorMessage.OTP_VERIFICATION_FAILED,
        null,
        HttpStatusCode.BAD_REQUEST
      );
      throw new Error(JSON.stringify(errorResponse));
    }
  }
}

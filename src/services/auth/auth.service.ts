import { ErrorMessage } from "../../enums/errorMessage.enum";
import HttpStatusCode from "../../enums/httpStatus.enum";
import UserRepository from "../../repositories/user/user.repository";
import bcryptjs from "bcryptjs";
import { TokenGenerator } from "../../util/tokenGenerator.util";
import ApiResponse from "../../util/response.util";
import OtpRepository from "../../repositories/otp/otp.repository";
import { mailsendFn } from "../../util/mailSender.util";

export default class AuthService {
  private _userRepository: UserRepository;
  private _otpRepository: OtpRepository;
  private _jwtTokenGenerator: TokenGenerator;
  constructor() {
    this._userRepository = new UserRepository();
    this._otpRepository = new OtpRepository();
    this._jwtTokenGenerator = new TokenGenerator();
  }

  async login(email: string, password: string) {
    try {
      const isExisting = await this._userRepository.findOne(email);
      if (!isExisting) {
        const response = ApiResponse.errorResponse(
          ErrorMessage.USER_NOT_FOUND,
          null,
          HttpStatusCode.NOT_FOUND
        );
        throw new Error(JSON.stringify(response));
      } else {
        const isPasswordMatch = await bcryptjs.compare(
          password,
          isExisting.password
        );
        if (!isPasswordMatch) {
          const response = ApiResponse.errorResponse(
            ErrorMessage.LOGIN_FAILED,
            null,
            HttpStatusCode.BAD_REQUEST
          );
          throw new Error(JSON.stringify(response));
        } else {
          const access_token = this._jwtTokenGenerator.generateAccessToken({
            _id: isExisting._id,
            email: isExisting.email,
          });
          const refresh_token = this._jwtTokenGenerator.generateRefreshToken({
            _id: isExisting._id,
            email: isExisting.email,
          });

          return {
            access_token,
            refresh_token,
            user: isExisting,
          };
        }
      }
    } catch (error) {
      throw error;
    }
  }

  async registration(username: string, email: string, password: string) {
    try {
      const isExisting = await this._userRepository.findOne(email);
      if (isExisting && isExisting.isVerified) {
        const response = ApiResponse.errorResponse(
          ErrorMessage.EMAIL_EXIST,
          null,
          HttpStatusCode.CONFLICT
        );
        throw new Error(JSON.stringify(response));
      } else if (isExisting && !isExisting.isVerified) {
        const { otp } = await this._otpRepository.create(isExisting.email);
        await mailsendFn(
          isExisting.email,
          'Verification email from "HALA-chat"',
          otp
        );
        return isExisting;
      } else {
        const hashedPassword = await bcryptjs.hash(password, 3);
        if (hashedPassword) {
          const newUser = await this._userRepository.registerUser(
            email,
            hashedPassword,
            username
          );
          if (newUser) {
            const { otp } = await this._otpRepository.create(email);
            await mailsendFn(email, 'Verification email from "HALA-chat', otp);
            return newUser;
          }
        }
      }
    } catch (error) {
      throw error;
    }
  }
}

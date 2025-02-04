import { ErrorMessage } from "../../enums/errorMessage.enum";
import HttpStatusCode from "../../enums/httpStatus.enum";
import UserRepository from "../../repositories/user/user.repository";
import bcryptjs from "bcryptjs";
import { TokenGenerator } from "../../util/tokenGenerator.util";

export default class AuthService {
  private _userRepository: UserRepository;
  private _jwtTokenGenerator: TokenGenerator;
  constructor() {
    this._userRepository = new UserRepository();
    this._jwtTokenGenerator = new TokenGenerator();
  }

  async login(email: string, password: string) {
    const isExisting = await this._userRepository.findOne(email);
    if (!isExisting) {
      return {
        message: ErrorMessage.USER_NOT_FOUND,
        code: HttpStatusCode.NOT_FOUND,
      };
    } else {
      const isPasswordMatch = await bcryptjs.compare(
        password,
        isExisting.password
      );
      if (!isPasswordMatch) {
        return {
          message: ErrorMessage.LOGIN_FAILED,
          code: HttpStatusCode.BAD_REQUEST,
        };
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
        };
      }
    }
  }

  registration() {
    
  }
}

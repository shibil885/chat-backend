import { NextFunction, Request, Response } from "express";
import AuthService from "../../services/auth/auth.service";
import ApiResponse from "../../util/response.util";
import HttpStatusCode from "../../enums/httpStatus.enum";
import { ErrorMessage } from "../../enums/errorMessage.enum";
import { SuccessMessage } from "../../enums/successMessage.enum";
import { IUser } from "../../interfaces/user/user.inerface";

export default class AuthController {
  private _authService: AuthService;
  constructor() {
    this._authService = new AuthService();
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        const response = ApiResponse.errorResponse(
          ErrorMessage.LOGIN_FAILED,
          null,
          HttpStatusCode.BAD_REQUEST
        );
        throw new Error(JSON.stringify(response));
      } else {
        const { access_token, refresh_token, user } =
          await this._authService.login(email, password);
        if (access_token && refresh_token) {
          res.cookie("access_token", access_token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
          });

          res.cookie("refresh_token", refresh_token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
          });
          const response = ApiResponse.successResponse<IUser>(
            SuccessMessage.ACCOUNT_VERIFIED,
            user,
            HttpStatusCode.OK,
            { access_token, refresh_token }
          );
          return res.status(HttpStatusCode.OK).json(response);
        }
      }
    } catch (error) {
      return next(error);
    }
  }

  async registration(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, username } = req.body;
      console.log(req.body);

      if (!email || !password || !username) {
        const response = ApiResponse.errorResponse(
          ErrorMessage.ACCOUNT_CREATION_FAILED,
          null,
          HttpStatusCode.BAD_REQUEST
        );
        throw new Error(JSON.stringify(response));
      } else {
        const user = await this._authService.registration(
          username,
          email,
          password
        );
        console.log(user);
        
        if (user) {
          const response = ApiResponse.successResponse<IUser>(
            SuccessMessage.OTP_SENT,
            user,
            HttpStatusCode.CREATED
          );

          return res.status(HttpStatusCode.CREATED).json(response);
        } else {
          let errorResponse = ApiResponse.errorResponse(
            ErrorMessage.ACCOUNT_CREATION_FAILED,
            null,
            HttpStatusCode.INTERNAL_SERVER_ERROR
          );
          throw new Error(JSON.stringify(errorResponse));
        }
      }
    } catch (error) {
      return next(error);
    }
  }
}

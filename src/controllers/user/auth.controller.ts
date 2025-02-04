import { NextFunction, Request, Response } from "express";
import AuthService from "../../services/auth/auth.service";
import { z } from "zod";
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
        const { access_token, refresh_token } = await this._authService.login(
          email,
          password
        );
        if (access_token && refresh_token) {
          const response = ApiResponse.successResponse<IUser>(
            SuccessMessage.ACCOUNT_VERIFIED,
            undefined,
            HttpStatusCode.OK,
            { access_token, refresh_token }
          );
        }
      }
    } catch (error) {
      return next(error);
    }
  }
}

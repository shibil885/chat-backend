import { NextFunction, Request, Response } from "express";
import OtpService from "../../services/otp/otp.service";
import ApiResponse from "../../util/response.util";
import { ErrorMessage } from "../../enums/errorMessage.enum";
import HttpStatusCode from "../../enums/httpStatus.enum";
import { SuccessMessage } from "../../enums/successMessage.enum";

export default class OtpController {
  private _otpService: OtpService;
  constructor() {
    this._otpService = new OtpService();
  }

  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        const errorMessage = ApiResponse.errorResponse(
          ErrorMessage.OTP_VERIFICATION_FAILED,
          null,
          HttpStatusCode.BAD_REQUEST
        );
        throw new Error(JSON.stringify(errorMessage));
      } else {
        const { access_token, refresh_token } =
          await this._otpService.otpSubmit(email, otp);
        const response = ApiResponse.successResponse(
          SuccessMessage.OTP_VERIFIED,
          null,
          HttpStatusCode.OK,
          { access_token, refresh_token }
        );
        return res.status(HttpStatusCode.OK).json(response);
      }
    } catch (error) {
      return next(error);
    }
  }

  async resend(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      if (!email) {
        const errorMessage = ApiResponse.errorResponse(
          ErrorMessage.OTP_RESEND_FAILED,
          null,
          HttpStatusCode.BAD_REQUEST
        );
        throw new Error(JSON.stringify(errorMessage));
      } else {

        // TODO

      }
    } catch (error) {
      return next(error);
    }
  }
}

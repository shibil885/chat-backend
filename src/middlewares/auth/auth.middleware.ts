import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { TokenGenerator } from "../../util/tokenGenerator.util";
import { ErrorMessage } from "../../enums/errorMessage.enum";
import HttpStatusCode from "../../enums/httpStatus.enum";
import ApiResponse from "../../util/response.util";

interface AuthRequest extends Request {
  user?: JwtPayload;
}

const jwtTokenGenerator = new TokenGenerator();

const secret = process.env.SECRET_KEY;
console.log('[MIDDLEWARE] SECRET_KEY:', process.env.SECRET_KEY);
if (!secret) {
  throw new Error("JWT secrets are not defined in environment variables");
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const accessToken = req.cookies["access_token"];
    const refreshToken = req.cookies["refresh_token"];
    if (!accessToken) {
      res
        .status(HttpStatusCode.UNAUTHORIZED)
        .json(
          ApiResponse.errorResponse(
            ErrorMessage.UNAUTHORIZED_ACCESS,
            null,
            HttpStatusCode.UNAUTHORIZED
          )
        );
      return;
    }

    try {
      const decodedAccessToken = jwt.verify(accessToken, secret) as JwtPayload;
      req.user = decodedAccessToken;
      next();
      return;
    } catch (error) {
      console.error("Access token verification failed", error);

      if (!refreshToken) {
        res
          .status(HttpStatusCode.UNAUTHORIZED)
          .json(
            ApiResponse.errorResponse(
              ErrorMessage.UNAUTHORIZED_ACCESS,
              null,
              HttpStatusCode.UNAUTHORIZED
            )
          );
        return;
      }

      try {
        const decodedRefreshToken = jwt.verify(
          refreshToken,
          secret
        ) as JwtPayload;
        const newAccessToken = jwtTokenGenerator.generateAccessToken({
          _id: decodedRefreshToken._id,
          email: decodedRefreshToken.email,
        });

        res.cookie("access_token", newAccessToken, {
          httpOnly: true,
          sameSite: "none",
          secure: true,
        });

        req.user = decodedRefreshToken;
        next();
        return;
      } catch (refreshError) {
        console.error("Refresh token verification failed", refreshError);
        res
          .status(HttpStatusCode.UNAUTHORIZED)
          .json(
            ApiResponse.errorResponse(
              ErrorMessage.UNAUTHORIZED_ACCESS,
              null,
              HttpStatusCode.UNAUTHORIZED
            )
          );
        return;
      }
    }
  } catch (error) {
    console.error("Authentication middleware error", error);
    res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json(
        ApiResponse.errorResponse(
          ErrorMessage.INTERNAL_SERVER_ERROR,
          null,
          HttpStatusCode.INTERNAL_SERVER_ERROR
        )
      );
    return;
  }
};

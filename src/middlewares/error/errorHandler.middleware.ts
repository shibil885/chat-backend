import { NextFunction, Request, Response } from "express";
import HttpStatusCode from "../../enums/httpStatus.enum";

export const ErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let errorResponse = error;
  let status = HttpStatusCode.INTERNAL_SERVER_ERROR;
  console.error("---E---", error.stack);

  if (typeof error !== "string") {
    errorResponse = JSON.parse(error.message);
    status = JSON.parse(error.message).code;
  }
  console.error(errorResponse);
  res.status(status).json(errorResponse);

};
import { NextFunction, Request, Response } from "express";

export const ErrorHandler = (
  error: Error | string,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (typeof error === "string") {
    console.log("error before parse", error);
    JSON.parse(error);
  }
  console.log("error after parse", error);
};

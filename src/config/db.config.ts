import mongoose from "mongoose";
import ApiResponse from "../util/response.util";
import HttpStatusCode from "../enums/httpStatus.enum";
import { ErrorMessage } from "../enums/errorMessage.enum";
import { SuccessMessage } from "../enums/successMessage.enum";

export default async function connectMongoDB() {
  try {
    const URL = process.env.MONGODB;
    if (!URL) {
      throw new Error(
        ErrorMessage.DB_URL_MISSING
      );
    }

    await mongoose.connect(URL);
    console.log(SuccessMessage.DB_CONNECTED);

    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
  } catch (error) {
    if (error instanceof Error) {
      throw ApiResponse.errorResponse(
        error.message,
        null,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    } else {
      throw ApiResponse.errorResponse(
        ErrorMessage.CONNECTION_ERROR,
        null,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}

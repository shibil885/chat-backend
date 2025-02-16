import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { extname } from "path";
import { ErrorMessage } from "../enums/errorMessage.enum";
import ApiResponse from "./response.util";
import HttpStatusCode from "../enums/httpStatus.enum";

const allowedImageTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
const allowedDocTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export default async function s3BucketFileUploader(
  fileName: string,
  fileBuffer: Buffer,
  fileType: string
) {
  if (![...allowedImageTypes, ...allowedDocTypes].includes(fileType)) {
    throw new Error(
      JSON.stringify(
        ApiResponse.errorResponse(
          ErrorMessage.INVALID_FILE_TYPE,
          `Invalid file type: ${fileType}`,
          HttpStatusCode.BAD_REQUEST
        )
      )
    );
  }

  const fileExtension = extname(fileName).toLowerCase();

  const contentType = fileType || "application/octet-stream";

  const {
    AWS_REGION,
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    S3_BUCKET_NAME,
  } = process.env;

  if (
    !AWS_REGION ||
    !AWS_ACCESS_KEY_ID ||
    !AWS_SECRET_ACCESS_KEY ||
    !S3_BUCKET_NAME
  ) {
    console.error("Missing AWS Configuration.");
    throw new Error(
      JSON.stringify(
        ApiResponse.errorResponse(
          ErrorMessage.FAILED_UPLOADS,
          "Missing AWS configuration",
          HttpStatusCode.INTERNAL_SERVER_ERROR
        )
      )
    );
  }

  const s3client = new S3Client({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
  });

  const params = {
    Bucket: S3_BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: contentType,
  };

  try {
    await s3client.send(new PutObjectCommand(params));
    const fileUrl = `https://${S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${fileName}`;
    return fileUrl;
  } catch (error) {
    console.error("Upload Error:", error);
    throw new Error(
      JSON.stringify(
        ApiResponse.errorResponse(
          ErrorMessage.FAILED_UPLOADS,
          "File upload failed. Please try again.",
          HttpStatusCode.INTERNAL_SERVER_ERROR
        )
      )
    );
  }
}

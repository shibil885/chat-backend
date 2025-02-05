export enum ErrorMessage {
  // Chat Errors
  MESSAGE_SEND_FAILED = "Failed to send message",
  MESSAGE_DELETE_FAILED = "Failed to delete message",
  MESSAGE_EDIT_FAILED = "Failed to edit message",
  CHAT_NOT_FOUND = "Chat not found",
  CONNECTION_LOST = "Connection lost, please reconnect",
  SERVER_ERROR = "Server error, please try again later",

  // Authentication & Authorization Errors
  ACCOUNT_CREATION_FAILED = "Account creation failed",
  LOGIN_FAILED = "Invalid credentials, login failed",
  UNAUTHORIZED_ACCESS = "Unauthorized access",
  TOKEN_EXPIRED = "Token expired, please log in again",
  TOKEN_INVALID = "Invalid token provided",
  ACCOUNT_LOCKED = "Account locked due to multiple failed attempts",

  // OTP & Security Errors
  OTP_SEND_FAILED = "Failed to send OTP",
  OTP_CREATION_FAILED = "OTP creation failed",
  OTP_VERIFICATION_FAILED = "Invalid OTP, verification failed",
  OTP_EXPIRED = "OTP expired, please request a new one",
  OTP_RESEND_FAILED = "Email not found, resend failed",
  PASSWORD_RESET_FAILED = "Failed to reset password",

  // User Errors
  USER_NOT_FOUND = "User not found ",
  PROFILE_UPDATE_FAILED = "Failed to update profile",
  EMAIL_EXIST = "Email already exist",
  USERNAME_EXIST = "Username alredy exist",

  //Mongo DB
  DB_URL_MISSING = "Data-base connection URL is missing",
  CONNECTION_ERROR = "Data base connection issue",
  // Other
  INTERNAL_SERVER_ERROR = "Something went wrong",
}

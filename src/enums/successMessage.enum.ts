export enum SuccessMessage {
  // Chat Messages
  MESSAGE_SENT = "Message sent successfully",
  MESSAGE_DELETED = "Message deleted successfully",
  MESSAGE_EDITED = "Message edited successfully",
  FETCHED_MESSAGES = "All messaged fetched",
  //
  CHAT_CREATED = "Chat created or fetched successfully",
  CHAT_CLEARED = "Chat cleared successfully",
  ALL_CHAT_FETCHED = "Successfully fetched all chat",
  CONNECTION_ESTABLISHED = "Connected to the server",
  CONNECTION_RESTORED = "Connection restored",
  NEW_USERS = "New users to chat",
  // Authentication & Authorization
  ACCOUNT_CREATED = "Account created successfully ",
  LOGIN_SUCCESS = "Login successful",
  LOGOUT_SUCCESS = "Logout successful",
  PASSWORD_CHANGED = "Password changed successfully",
  TOKEN_REFRESHED = "Token refreshed successfully",
  ACCOUNT_VERIFIED = "Account verified successfully",

  // OTP & Security
  OTP_SENT = "OTP sent successfully",
  OTP_VERIFIED = "OTP verified successfully",
  OTP_RESENT = "OTP resent successfully",

  // User Status
  USER_ONLINE = "User is online now",
  USER_OFFLINE = "User is offline now",
  PROFILE_UPDATED = "Profile updated successfully",

  // MongoDb
  DB_CONNECTED = "MongoDB connected successfully",
}

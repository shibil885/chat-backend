import mongoose, { Schema } from "mongoose";

const chatMessageSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    content: {
      type: String,
    },
    attachments: {
      type: {
        fileName: String,
        url: String,
        fileType: String,
      },
      default: { name: "", url: "", fileType: "" },
    },
    chat: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ChatMessage", chatMessageSchema);

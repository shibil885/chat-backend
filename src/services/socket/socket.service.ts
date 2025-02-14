import { Server, Socket } from "socket.io";
import * as cookie from "cookie";
import ApiResponse from "../../util/response.util";
import { ErrorMessage } from "../../enums/errorMessage.enum";
import HttpStatusCode from "../../enums/httpStatus.enum";
import jwt from "jsonwebtoken";
import userModel from "../../models/user.model";
import { IPayload } from "../../interfaces/payload.interface";
import { AuthRequest } from "../../interfaces/decodedJwt.interface";
import { ChatEventEnum } from "../../enums/socketEvent.enum";

export default class SocketService {
  constructor() {}

  mountJoinChatEvent(socket: Socket) {
    socket.on(ChatEventEnum.JOIN_CHAT_EVENT, (chatId: string) => {
      console.log(socket.id,`User joined the chat 🤝. chatId: `, chatId);
      socket.join(chatId);
    });
  }

  mountParticipantTypingEvent(socket: Socket) {
    socket.on(ChatEventEnum.TYPING_EVENT, (chatId) => {
      console.log("invoked", chatId);
      socket.in(chatId).emit(ChatEventEnum.TYPING_EVENT, { chatId });
    });
  }

  mountParticipantStoppedTypingEvent(socket: Socket) {
    socket.on(ChatEventEnum.STOP_TYPING_EVENT, (chatId: string) => {
      socket.in(chatId).emit(ChatEventEnum.STOP_TYPING_EVENT, chatId);
    });
  }

  static initializeSocketIO(io: Server) {
    const socketService = new SocketService();
    return io.on("connection", async (socket) => {
      try {
        console.log("New socket connection attempt:", socket.id);

        const cookies = socket.handshake.headers.cookie
          ? cookie.parse(socket.handshake.headers.cookie)
          : {};
        let token = cookies?.access_token;

        if (!token) {
          token = socket.handshake.auth?.token;
          console.log("Token from handshake auth:", token);
        }

        if (!token) {
          throw new Error(
            JSON.stringify(
              ApiResponse.errorResponse(
                ErrorMessage.UNAUTHORIZED_ACCESS,
                null,
                HttpStatusCode.UNAUTHORIZED
              )
            )
          );
        }

        if (!process.env.SECRET_KEY) {
          throw new Error(
            JSON.stringify(
              ApiResponse.errorResponse(
                ErrorMessage.UNAUTHORIZED_ACCESS,
                null,
                HttpStatusCode.UNAUTHORIZED
              )
            )
          );
        }

        const decodedToken = jwt.verify(
          token,
          process.env.SECRET_KEY
        ) as IPayload;

        const user = await userModel
          .findById(decodedToken._id)
          .select("-password ");

        if (!user) {
          throw new Error(
            JSON.stringify(
              ApiResponse.errorResponse(
                ErrorMessage.UNAUTHORIZED_ACCESS,
                null,
                HttpStatusCode.UNAUTHORIZED
              )
            )
          );
        }

        socket.join(user._id.toString());
        console.log(`User joined room: ${user._id.toString()}`);

        socket.emit(ChatEventEnum.CONNECTED_EVENT);
        console.log("Emitted CONNECTED_EVENT to user:", user._id.toString());

        socketService.mountJoinChatEvent(socket);
        socketService.mountParticipantTypingEvent(socket);
        socketService.mountParticipantStoppedTypingEvent(socket);

        socket.on(ChatEventEnum.DISCONNECT_EVENT, () => {
          console.log("User disconnected:", socket.id);
          if (socket.id) {
            socket.leave(socket.id);
          }
        });
      } catch (error) {
        console.error("Socket connection error:", error);
        socket.emit(
          ChatEventEnum.SOCKET_ERROR_EVENT,
          "Something went wrong while connecting to the socket."
        );
      }
    });
  }
  static emitSocketEvent(
    req: AuthRequest,
    roomId: string,
    event: ChatEventEnum,
    payload: any
  ) {
    req.app.get("io").in(roomId).emit(event, payload);
  }
}

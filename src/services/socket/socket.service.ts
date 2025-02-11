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
      console.log(`User joined the chat 🤝. chatId: `, chatId);
      // joining the room with the chatId will allow specific events to be fired where we don't bother about the users like typing events
      // E.g. When user types we don't want to emit that event to specific participant.
      // We want to just emit that to the chat where the typing is happening
      socket.join(chatId);
    });
  }

  /**
   * @description This function is responsible to emit the typing event to the other participants of the chat
   * @param {Socket} socket
   */
  mountParticipantTypingEvent(socket: Socket) {
    socket.on(ChatEventEnum.TYPING_EVENT, (chatId: string) => {
      socket.in(chatId).emit(ChatEventEnum.TYPING_EVENT, chatId);
    });
  }

  /**
   * @description This function is responsible to emit the stopped typing event to the other participants of the chat
   * @param {Socket} socket
   */
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
          // If there is no access token in cookies, check the handshake auth
          token = socket.handshake.auth?.token;
          console.log("Token from handshake auth:", token);
        }

        if (!token) {
          // Token is required for the socket to work
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

        // Emit the connected event
        socket.emit(ChatEventEnum.CONNECTED_EVENT);
        console.log("Emitted CONNECTED_EVENT to user:", user._id.toString());

        // Mount event listeners
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

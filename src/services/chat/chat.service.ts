import { Types } from "mongoose";
import ChatRepository from "../../repositories/chat/chat.repository";
import UserRepository from "../../repositories/user/user.repository";

export default class ChatService {
  private _chatRepository: ChatRepository;
  private _userRepository: UserRepository;
  constructor() {
    this._chatRepository = new ChatRepository();
    this._userRepository = new UserRepository();
  }

  async newUsers(userId: Types.ObjectId) {
    try {
        const newUsers = await this._userRepository.newUsers(userId);
        return newUsers
    } catch (error) {
        throw error
    }
  }
}

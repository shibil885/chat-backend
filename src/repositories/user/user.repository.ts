import { Types } from "mongoose";
import UserModel from "../../models/user.model";

export default class UserRepository {
  async registerUser(email: string, password: string, username: string) {
    const newUser = await new UserModel({
      email: email,
      password: password,
      username: username,
    }).save();

    return newUser;
  }

  async findOne(email: string) {
    return await UserModel.findOne({ email: email });
  }

  async userVerified(email: string) {
    return await UserModel.findOneAndUpdate(
      { email: email },
      { isVerified: true }
    );
  }

  async newUsers(userId: Types.ObjectId) {
    return UserModel.find({ isVerified: true, _id: { $ne: userId } });
  }
}

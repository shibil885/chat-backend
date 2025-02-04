import UserModel from "../../models/user.model";


export default class UserRepository {

  async findOne(email: string) {
    return await UserModel.findOne({ email: email });
  }
  
}

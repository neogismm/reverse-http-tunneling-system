import { Injectable, Dependencies } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
@Dependencies(getModelToken('User'))
export class UsersService {
  constructor(userModel) {
    this.userModel = userModel;
  }

  async findOne(username) {
    // Used during Login to find the user
    return this.userModel.findOne({ username }).exec();
  }

  async create(username, plainTextPassword) {
    // 1. Generate a "salt" (random data to make the hash unique)
    const salt = await bcrypt.genSalt(10);
    // 2. Hash the password
    const hashedPassword = await bcrypt.hash(plainTextPassword, salt);
    
    // 3. Save to DB
    const createdUser = new this.userModel({
      username,
      password: hashedPassword,
    });
    return createdUser.save();
  }
}
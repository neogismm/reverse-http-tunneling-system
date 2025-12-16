import { Injectable, Dependencies, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
@Dependencies(UsersService, JwtService)
export class AuthService {
  constructor(usersService, jwtService) {
    this.usersService = usersService;
    this.jwtService = jwtService;
  }

  // 1. Verify if username/password match
  async validateUser(username, pass) {
    const user = await this.usersService.findOne(username);
    if (user && (await bcrypt.compare(pass, user.password))) {
      // Strip password from result before returning
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  // 2. Generate the JWT Token
  async login(user) {
    const payload = { username: user.username, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // 3. Register a new user
  async register(username, password) {
    return this.usersService.create(username, password);
  }
}
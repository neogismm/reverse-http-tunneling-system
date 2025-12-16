import { Controller, Post, Body, Dependencies, Bind, Req } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
@Dependencies(AuthService)
export class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  @Post('register')
  @Bind(Body())
  async register(body) {
    return this.authService.register(body.username, body.password);
  }

  @Post('login')
  @Bind(Body())
  async login(body) {
    const user = await this.authService.validateUser(body.username, body.password);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    return this.authService.login(user);
  }
}
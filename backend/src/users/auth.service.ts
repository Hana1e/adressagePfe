import { Injectable } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dtos/login.dto';

@Injectable()
export class AuthService {
  constructor(
      private usersService: UsersService,
      private jwtService: JwtService,
  ) {}

  async validateUser(loginDto: LoginDto): Promise<any> {
      const { email, password } = loginDto;
      const user = await this.usersService.findByEmail(email);
      if (user && await this.usersService.validatePassword(user, password)) {
          return user;
      }
      return null;
  }

  async generateToken(user: any): Promise<{ token: string, userId: string }> {
      const payload = { email: user.email, sub: user._id };
      const token = this.jwtService.sign(payload);
      return { token, userId: user._id.toString() };
  }
}
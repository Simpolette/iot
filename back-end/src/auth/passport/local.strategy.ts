
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { BadGatewayException, BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email', // Quan trọng: Passport mặc định tìm 'username', phải đổi thành 'email'
      passwordField: 'password'
    });
  }

  async validate(email: string, password: string): Promise<any> {
    console.log('🔐 LocalStrategy validating:', email);
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      console.error("❌ User not found or invalid credentials");
      throw new UnauthorizedException("Email hoặc mật khẩu không đúng");
    }
    console.log('✅ User validated:', user.email);
    return user;
  }
}

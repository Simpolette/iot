
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../modules/users/users.service';
import { comparePassword } from 'src/helper/util';
import { access } from 'fs';
import { JwtService } from '@nestjs/jwt';
import { register } from 'module';
import { CreateAuthDto } from './dto/create-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async validateUser(email: string, pass: string): Promise<any> {
    console.log('📧 Looking up user:', email);
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      console.error("❌ User not found");
      throw new UnauthorizedException("Email hoặc mật khẩu không đúng");
    }
    console.log('✅ User found:', { email: user.email, isActive: user.isActive, hasPassword: !!user.password });

    // Kiểm tra tài khoản đã kích hoạt chưa
    if (!user.isActive) {
      console.log('❌ Account not activated');
      throw new UnauthorizedException("Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email để xác thực.");
    }

    const isMatch = await comparePassword(pass, user.password);
    console.log("🔑 Password match:", isMatch);
    if (!isMatch) {
      console.error("❌ Password mismatch");
      throw new UnauthorizedException("Email hoặc mật khẩu không đúng");
    }

    console.log('✅ User validated successfully');
    return user;
  }

  async login(user: any) {
    const payload = { sub: user._id, email: user.email };
    return {
      accessToken: await this.jwtService.sign(payload),
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  }

  handleRegister = async (registerDto: CreateAuthDto) => {
    return await this.usersService.handleRegister(registerDto);
  }

  async validateCode(codeID: string) {
    const user = await this.usersService.findByCodeID(codeID);
    if (!user) {
      console.error("User not found or code expired");
      throw new UnauthorizedException('Invalid or expired code');
    }
    return user;
  }
}

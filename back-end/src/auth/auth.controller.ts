import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, BadRequestException, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { Public } from 'src/customize/customize';
import { CreateAuthDto } from './dto/create-auth.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailerService: MailerService,

  ) { }

  @Post("login")
  @Public()
  @UseGuards(LocalAuthGuard)
  handleLogin(@Req() req: any) {
    return this.authService.login(req.user);
  }

  @Post("register")
  @Public()
  register(@Body() registerDto: CreateAuthDto) {
    return this.authService.handleRegister(registerDto);
  }

  @Get('mail')
  @Public()
  testMail() {
    const testCode = Math.floor(100000 + Math.random() * 900000).toString();
    this.mailerService
      .sendMail({
        to: 'nguyenhuyguan159357@gmail.com', // list of receivers
        subject: 'Testing SmartDry Mail ✔', // Subject line
        text: 'welcome', // plaintext body
        template: 'register',
        context: {
          name: "Nguyễn Huy Quân",
          activationCode: testCode, // Mã OTP 6 số
        }
      })
      .then(() => {
        console.log('Email sent successfully with code:', testCode);
      })
      .catch((err) => {
        console.error("Error sending email", err);
      });
    return { message: "Email sent", code: testCode };
  }

  @Post('verify')
  @Public()
  async handleVerify(@Body() body: { email: string, code: string }) {
    const { email, code } = body;
    if (!email || !code) {
      throw new BadRequestException('Email and code are required');
    }
    const user = await this.authService.validateCode(code);
    if (!user) {
      throw new NotFoundException('Invalid verification code');
    }
    if (!user.codeExpire || user.codeExpire < new Date()) {
      throw new BadRequestException('Verification code has expired. Please register again.');
    }
    if (user.email !== email) {
      throw new BadRequestException('Email does not match');
    }

    user.isActive = true;
    user.codeID = undefined; // Xóa mã sau khi verify thành công
    user.codeExpire = undefined;
    await user.save();
    
    return {
      message: 'Account verified successfully!',
      success: true
    };
  }

}

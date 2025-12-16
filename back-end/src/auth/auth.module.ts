import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from 'src/modules/users/schemas/user.schema';
import { UsersModule } from 'src/modules/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Passport } from 'passport';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './passport/local.strategy';
import { JwtStrategy } from './passport/jwt.strategy';
import { ActiveUserService } from '../services/active-user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { in4_arduino, in4_arduinoSchema } from '../modules/in4_arduino/schema/in4_arduino.schema';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([{ name: in4_arduino.name, schema: in4_arduinoSchema }]),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('JWT_SECRET'), 
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION'), // Token expiration time
        },
      }),
      inject: [ConfigService],
    }),
    PassportModule
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, ActiveUserService],
  exports: [ActiveUserService],
})
export class AuthModule { }

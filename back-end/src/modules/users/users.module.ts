import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { PushsaferService } from '../pushsafer/pushsafer.service';
// import { TelegramModule } from 'src/telegram/telegram.module'; // Vô hiệu hóa telegram

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    // forwardRef(() => TelegramModule), // Vô hiệu hóa telegram
  ],
  controllers: [UsersController],
  providers: [UsersService, PushsaferService],
  exports: [UsersService],
})
export class UsersModule {}

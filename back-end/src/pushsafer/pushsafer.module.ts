import { Module } from '@nestjs/common';
import { PushsaferService } from './pushsafer.service';
import { PushsaferController } from './pushsafer.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [PushsaferController],
  providers: [PushsaferService],
  exports: [PushsaferService],
})
export class PushsaferModule {}

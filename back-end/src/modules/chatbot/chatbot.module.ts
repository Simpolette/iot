import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { GeminiService } from './gemini.service';

@Module({
  imports: [ConfigModule],
  controllers: [ChatbotController],
  providers: [ChatbotService, GeminiService],
  exports: [ChatbotService, GeminiService],
})
export class ChatbotModule {}

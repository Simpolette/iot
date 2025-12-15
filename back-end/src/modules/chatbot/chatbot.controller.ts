import { Public } from 'src/customize/customize';
import { Controller, Post, Body } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Public()
  @Post()
  getReply(@Body('message') message: string) {
    const reply = this.chatbotService.generateReply(message);
    return { reply };
  }
}

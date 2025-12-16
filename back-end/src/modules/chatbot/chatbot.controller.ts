import { Public } from 'src/customize/customize';
import { Controller, Post, Body, Delete, Query } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Public()
  @Post()
  async getReply(
    @Body('message') message: string,
    @Body('userId') userId?: string,
  ) {
    const reply = await this.chatbotService.generateReply(message, userId);
    return { reply };
  }

  @Public()
  @Delete('history')
  clearHistory(@Query('userId') userId: string) {
    this.chatbotService.clearHistory(userId || 'anonymous');
    return { message: 'Chat history cleared successfully' };
  }
}

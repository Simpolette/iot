import { Injectable } from '@nestjs/common';
import { generateResponse } from 'src/helper/chatbot.utils'

@Injectable()
export class ChatbotService {
  generateReply(message: string): string {
    return generateResponse(message);
  }
}

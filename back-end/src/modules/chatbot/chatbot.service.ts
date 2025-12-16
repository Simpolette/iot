import { Injectable, Logger } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { generateResponse } from 'src/helper/chatbot.utils';

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);

  constructor(private readonly geminiService: GeminiService) {}

  /**
   * Tạo phản hồi chatbot với Gemini AI hoặc fallback
   */
  async generateReply(message: string, userId?: string): Promise<string> {
    // Kiểm tra nếu Gemini AI có sẵn
    if (this.geminiService.isAvailable()) {
      try {
        this.logger.log(`🤖 Sử dụng Gemini AI cho câu hỏi: "${message}"`);
        const response = await this.geminiService.generateResponse(message, userId);
        return response;
      } catch (error) {
        this.logger.error('❌ Gemini AI lỗi, chuyển sang fallback mode:', error.message);
        // Nếu Gemini lỗi, dùng pattern matching
        return this.fallbackResponse(message);
      }
    } else {
      // Nếu Gemini không khả dụng, dùng pattern matching
      this.logger.log(`⚠️ Gemini AI không khả dụng, sử dụng pattern matching`);
      return this.fallbackResponse(message);
    }
  }

  /**
   * Fallback response sử dụng pattern matching cũ
   */
  private fallbackResponse(message: string): string {
    return generateResponse(message);
  }

  /**
   * Xóa lịch sử chat của user
   */
  clearHistory(userId: string): void {
    this.geminiService.clearChatHistory(userId);
  }
}

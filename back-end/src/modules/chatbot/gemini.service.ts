import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private genAI: GoogleGenerativeAI;
  private model: any;
  private chatSessions: Map<string, any> = new Map(); // Store chat sessions

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      this.logger.warn('⚠️ GEMINI_API_KEY không được cấu hình hoặc chưa thay đổi. Chatbot sẽ dùng fallback mode.');
      this.logger.warn('📝 Hướng dẫn: Lấy API key tại https://aistudio.google.com/app/apikey');
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      
      // Sử dụng tên model theo Google AI Studio 2025
      this.model = this.genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash', 
        generationConfig: {
          temperature: 0.9,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
        },
      });
      this.logger.log('✅ Gemini AI đã được khởi tạo thành công');
    } catch (error) {
      this.logger.error('❌ Lỗi khởi tạo Gemini AI:', error.message || error);
      this.logger.warn('💡 Có thể API key chưa đúng hoặc chưa kích hoạt. Chatbot sẽ dùng fallback mode.');
    }
  }

  /**
   * System prompt định nghĩa ngữ cảnh cho chatbot
   */
  private getSystemPrompt(): string {
    return `Bạn là trợ lý AI thông minh cho hệ thống "SmartDry" - Giàn phơi thông minh tự động.

🎯 THÔNG TIN HỆ THỐNG:
- Tên: SmartDry - Giàn Phơi Thông Minh
- Chức năng: Tự động thu phóng giàn phơi dựa trên thời tiết
- Cảm biến: Mưa, Nhiệt độ, Độ ẩm, Ánh sáng
- Thiết bị: ESP32 kết nối WiFi
- Platform: Web Dashboard với NestJS backend

📋 VAI TRÒ CỦA BẠN:
1. Hỗ trợ người dùng sử dụng hệ thống SmartDry
2. Giải thích về các tính năng và cảm biến
3. Hướng dẫn kết nối và cấu hình ESP32
4. Trả lời các câu hỏi về IoT, giàn phơi thông minh
5. Gợi ý cài đặt tối ưu cho từng điều kiện thời tiết

🎨 PHONG CÁCH TRẢ LỜI:
- Thân thiện, dễ hiểu, chuyên nghiệp
- Sử dụng emoji phù hợp (🌧️☀️🌡️💡)
- Ngắn gọn, súc tích (2-4 câu)
- Ưu tiên tiếng Việt
- Nếu câu hỏi không liên quan đến SmartDry, lịch sự từ chối và gợi ý câu hỏi phù hợp

⚙️ KIẾN THỨC KỸ THUẬT:
- Cảm biến mưa: Phát hiện nước → Tự động đóng giàn
- Nhiệt độ: Ngưỡng > 35°C → Cảnh báo quá nóng
- Độ ẩm: Ngưỡng > 80% → Đề xuất đóng giàn
- Ánh sáng: < 200 lux → Trời tối, có thể mưa
- ESP32: Kết nối WiFi "ESP32_Config", password: "12345678"

💡 CÁC LỆNH HỖ TRỢ:
/help - Hướng dẫn sử dụng
/status - Xem trạng thái hệ thống
/setup - Hướng dẫn cài đặt ESP32

Hãy trả lời một cách hữu ích và chính xác!`;
  }

  /**
   * Tạo hoặc lấy chat session cho user
   */
  private getChatSession(userId: string = 'anonymous') {
    if (!this.chatSessions.has(userId)) {
      const chat = this.model.startChat({
        history: [
          {
            role: 'user',
            parts: [{ text: this.getSystemPrompt() }],
          },
          {
            role: 'model',
            parts: [{ text: 'Xin chào! Tôi là trợ lý AI của SmartDry. Tôi sẵn sàng giúp bạn với mọi câu hỏi về hệ thống giàn phơi thông minh. Bạn cần hỗ trợ gì? 😊' }],
          },
        ],
      });
      this.chatSessions.set(userId, chat);
    }
    return this.chatSessions.get(userId);
  }

  /**
   * Gửi tin nhắn đến Gemini và nhận phản hồi
   */
  async generateResponse(message: string, userId: string = 'anonymous'): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini AI chưa được khởi tạo');
    }

    try {
      const chat = this.getChatSession(userId);
      
      // Thêm context về thời gian nếu cần
      const contextMessage = this.addContext(message);
      
      const result = await chat.sendMessage(contextMessage);
      const response = await result.response;
      const text = response.text();

      this.logger.debug(`User [${userId}]: ${message}`);
      this.logger.debug(`Bot: ${text}`);

      return text;
    } catch (error) {
      this.logger.error('❌ Lỗi khi gọi Gemini API:', error);
      throw error;
    }
  }

  /**
   * Thêm context về thời gian, thời tiết (có thể mở rộng)
   */
  private addContext(message: string): string {
    const now = new Date();
    const hour = now.getHours();
    const timeContext = hour < 12 ? 'buổi sáng' : hour < 18 ? 'buổi chiều' : 'buổi tối';
    
    // Có thể thêm dữ liệu sensor thực tế từ database
    return `[${timeContext}] ${message}`;
  }

  /**
   * Xóa chat history của user (reset conversation)
   */
  clearChatHistory(userId: string = 'anonymous') {
    this.chatSessions.delete(userId);
    this.logger.log(`🗑️ Đã xóa lịch sử chat của user: ${userId}`);
  }

  /**
   * Kiểm tra Gemini có sẵn sàng không
   */
  isAvailable(): boolean {
    return !!this.model;
  }
}

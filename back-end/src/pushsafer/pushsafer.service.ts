import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class PushsaferService {
  private readonly privateKey: string;

  constructor(private readonly configService: ConfigService) {
    this.privateKey = this.configService.get<string>('PUSHSAFER_KEY') || '';
  }

  /**
   * Gửi thông báo qua Pushsafer API
   * @param message Nội dung thông báo
   * @param title Tiêu đề thông báo (optional)
   * @param icon Icon ID (optional, mặc định 60 - weather/rain)
   * @param priority Priority (optional, -2 to 2, mặc định 1)
   */
  async sendNotification(
    message: string,
    title?: string,
    icon?: number,
    priority?: number,
  ): Promise<boolean> {
    try {
      if (!this.privateKey) {
        console.warn('⚠️ PUSHSAFER_KEY không được cấu hình trong .env');
        return false;
      }

      const apiUrl = 'https://www.pushsafer.com/api';

      // Tạo params cho GET request
      const params = {
        k: this.privateKey, // Private Key
        m: message, // Message
        t: title || 'SmartDry Alert', // Title
        i: icon !== undefined ? icon : 60, // Icon (60 = weather/rain)
        pr: priority !== undefined ? priority : 1, // Priority (1 = high)
      };

      console.log('📤 Đang gửi thông báo Pushsafer...');

      const response = await axios.get(apiUrl, {
        params,
        timeout: 10000, // 10 seconds timeout
      });

      if (response.data && response.data.status === 1) {
        console.log('✅ Pushsafer notification sent successfully');
        return true;
      } else {
        console.error('❌ Pushsafer API error:', response.data);
        return false;
      }
    } catch (error) {
      console.error('❌ Lỗi khi gửi Pushsafer notification:', error.message);
      return false;
    }
  }

  /**
   * Gửi thông báo mưa (rain alert) với format đặc biệt
   */
  async sendRainAlert(): Promise<boolean> {
    const message = '[size=24]Trời mưa!!! Tự động thu dàn phơi![/size]';
    return this.sendNotification(message, '🌧️ Cảnh báo mưa', 60, 2);
  }

  /**
   * Test notification - dùng để test từ Postman
   */
  async sendTestNotification(): Promise<boolean> {
    const message =
      'Test notification từ Postman - ' +
      new Date().toLocaleTimeString('vi-VN');
    return this.sendNotification(message, '🧪 Test Pushsafer', 1, 0);
  }
}

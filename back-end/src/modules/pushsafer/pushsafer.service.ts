import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PushsaferService {
  private readonly PUSHSAFER_API_URL = 'https://www.pushsafer.com/api';
  private readonly PRIVATE_KEY = 'DcdCAEtZPvkrwrFxkBOT';

  /**
   * Gửi thông báo qua Pushsafer khi trời mưa
   * @param message Nội dung thông báo
   */
  async sendRainAlert(message?: string): Promise<void> {
    try {
      const defaultMessage = encodeURIComponent(
        '[size=24]Phát hiện trời mưa!![/size]',
      );
      const params = {
        k: this.PRIVATE_KEY,
        i: '60', // Icon ID
        m: message ? encodeURIComponent(message) : defaultMessage,
      };

      const url = `${this.PUSHSAFER_API_URL}?k=${params.k}&i=${params.i}&m=${params.m}`;

      console.log('📤 Sending Pushsafer notification:', url);

      const response = await axios.get(url);

      if (response.data.status === 1) {
        console.log('✅ Pushsafer notification sent successfully');
      } else {
        console.error('❌ Pushsafer notification failed:', response.data);
      }
    } catch (error) {
      console.error('❌ Error sending Pushsafer notification:', error.message);
    }
  }

  /**
   * Gửi thông báo tùy chỉnh qua Pushsafer
   * @param message Nội dung thông báo
   * @param title Tiêu đề thông báo
   * @param icon Icon ID (mặc định: 60)
   */
  async sendNotification(
    message: string,
    title?: string,
    icon: string = '60',
  ): Promise<void> {
    try {
      const formattedMessage = title
        ? `[size=20]${title}[/size]\n${message}`
        : message;

      const params = {
        k: this.PRIVATE_KEY,
        i: icon,
        m: encodeURIComponent(formattedMessage),
      };

      const url = `${this.PUSHSAFER_API_URL}?k=${params.k}&i=${params.i}&m=${params.m}`;

      const response = await axios.get(url);

      if (response.data.status === 1) {
        console.log('✅ Pushsafer custom notification sent');
      } else {
        console.error(
          '❌ Pushsafer custom notification failed:',
          response.data,
        );
      }
    } catch (error) {
      console.error(
        '❌ Error sending custom Pushsafer notification:',
        error.message,
      );
    }
  }
}

import { Controller, Post, Body, Get } from '@nestjs/common';
import { PushsaferService } from './pushsafer.service';

@Controller('pushsafer')
export class PushsaferController {
  constructor(private readonly pushsaferService: PushsaferService) {}

  /**
   * Test endpoint - gửi thông báo test
   * POST /api/pushsafer/test
   */
  @Post('test')
  async sendTestNotification() {
    const result = await this.pushsaferService.sendTestNotification();
    return {
      success: result,
      message: result
        ? 'Pushsafer notification sent successfully! Check your phone.'
        : 'Failed to send notification. Check server logs.',
    };
  }

  /**
   * Send rain alert - gửi cảnh báo mưa
   * POST /api/pushsafer/rain
   */
  @Post('rain')
  async sendRainAlert() {
    const result = await this.pushsaferService.sendRainAlert();
    return {
      success: result,
      message: result
        ? '🌧️ Rain alert sent successfully!'
        : 'Failed to send rain alert.',
    };
  }

  /**
   * Send custom notification
   * POST /api/pushsafer/send
   * Body: { message: string, title?: string, icon?: number, priority?: number }
   */
  @Post('send')
  async sendCustomNotification(
    @Body()
    body: {
      message: string;
      title?: string;
      icon?: number;
      priority?: number;
    },
  ) {
    const { message, title, icon, priority } = body;
    const result = await this.pushsaferService.sendNotification(
      message,
      title,
      icon,
      priority,
    );
    return {
      success: result,
      message: result
        ? 'Custom notification sent!'
        : 'Failed to send notification.',
    };
  }
}

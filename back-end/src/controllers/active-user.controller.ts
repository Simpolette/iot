import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ActiveUserService } from '../services/active-user.service';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.gaurd';
import { Public } from '../customize/customize';

@Controller('active-user')
export class ActiveUserController {
  constructor(private readonly activeUserService: ActiveUserService) {}

  /**
   * Lấy email của active user hiện tại
   */
  @Get('current')
  @Public()
  getCurrentActiveUser() {
    return {
      email: this.activeUserService.getActiveUserEmail(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Set active user email (dùng cho admin hoặc testing)
   */
  @Post('set')
  @UseGuards(JwtAuthGuard)
  async setActiveUser(@Body('email') email: string) {
    await this.activeUserService.setActiveUserEmail(email);
    return {
      success: true,
      email: email,
      message: `Active user đã được set thành: ${email}`
    };
  }

  /**
   * Migrate data thủ công
   */
  @Post('migrate')
  @UseGuards(JwtAuthGuard)
  async migrateData(
    @Body('fromEmail') fromEmail: string,
    @Body('toEmail') toEmail: string
  ) {
    const count = await this.activeUserService.manualMigrate(fromEmail, toEmail);
    return {
      success: true,
      migratedRecords: count,
      fromEmail,
      toEmail
    };
  }

  /**
   * Lấy thống kê email trong database
   */
  @Get('stats')
  @Public()
  async getEmailStats() {
    const stats = await this.activeUserService.getEmailStats();
    return {
      success: true,
      stats,
      totalEmails: stats.length
    };
  }

  /**
   * Migrate tất cả default email sang email cụ thể
   */
  @Post('migrate-default')
  @Public()
  async migrateDefaultEmail(@Body('email') email: string) {
    if (!email) {
      return {
        success: false,
        message: 'Email is required'
      };
    }

    const count = await this.activeUserService.migrateDefaultEmailData(email);
    return {
      success: true,
      migratedRecords: count,
      targetEmail: email,
      message: `Đã migrate ${count} records sang ${email}`
    };
  }
}

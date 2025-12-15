import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { SettingService } from './setting.service';
import { link } from 'fs';

@Controller('settings')
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Get(':email/get')
  getSettings(@Param('email') email: string, @Query('limit') limit: number = 100000) {
    console.log('[GET /settings] Trả về ngưỡng cài đặt');
    return this.settingService.getThresholds(limit, email);
  }

  @Post(':email/create')
  createSettings(@Param('email') email: string, @Body() body: any) {
    console.log('[POST /settings] Dữ liệu nhận từ frontend:', body);
    this.settingService.createThresholds(body, email);
    return { message: 'Created successfully' };
  }

  @Post(':email/update')
  updateSettings(@Param('email') email: string, @Body() body: any) {
    console.log('[POST /settings] Dữ liệu nhận từ frontend:', body);
    this.settingService.updateThresholds(body, email );
    return { message: 'Updated successfully' };
  }
}

import { Injectable, Query } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Setting, SettingDocument } from './schema/setting.schema';


@Injectable()
export class SettingService {
  constructor(@InjectModel(Setting.name) private settingModel: Model<SettingDocument>) {}

  async getThresholds(
    @Query('limit') limit: number = 1, 
    @Query('email') email: string
): Promise<Setting[]> {
    console.log('[SettingService] Fetching thresholds for', email);

    if (await this.settingModel.countDocuments({ email }) === 0) {
        // Nếu email này chưa có cài đặt thì tạo mặc định cho giàn phơi thông minh
        const defaultSettings = {
            autoModeEnabled: false,         // Tắt chế độ tự động (mặc định điều khiển thủ công)
            autoCloseHumidity: 80,          // Ngưỡng độ ẩm tự động đóng (%)
            useHumidityForAuto: true,       // Sử dụng độ ẩm để kích hoạt tự động
            useRainForAuto: true,           // Sử dụng cảm biến mưa để kích hoạt tự động
            nightRetract: false,            // Không tự động thu vào ban đêm
            buzzerEnabled: false,           // Tắt buzzer
            enableNotifications: true,      // Bật thông báo email
            email: email,
            wifiSSID: '',
            wifiPassword: '',
        };
        await this.settingModel.create(defaultSettings);
    }

    return await this.settingModel
        .find({ email })
        .sort({ createdAt: -1 })
        .limit(limit)
        .exec();
}


  async createThresholds(body: any, email: string): Promise<void> {
    console.log('[SettingService] Creating thresholds with data:', body);
    const newSettings = new this.settingModel({ ...body, email });
    await newSettings.save();
  }

  async updateThresholds(body: any, email: string): Promise<void> {
    console.log('[SettingService] Updating thresholds with data:', body);
    await this.settingModel.updateOne({ email }, body, { upsert: true }).exec();
  }
}
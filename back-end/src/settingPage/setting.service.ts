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
            autoCloseTemperature: 35,       // Nhiệt độ tự động đóng (°C)
            autoCloseHumidity: 80,          // Độ ẩm tự động đóng (%)
            minLightLevel: 200,             // Mức ánh sáng tối thiểu (lux)
            autoCloseOnRain: true,          // Tự động đóng khi mưa
            enableNotifications: true,      // Bật thông báo
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
    await this.settingModel.updateOne({}, body, { upsert: true }).exec();
  }
}
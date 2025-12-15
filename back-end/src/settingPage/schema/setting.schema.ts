import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SettingDocument = HydratedDocument<Setting>;

@Schema({ timestamps: true })
export class Setting {
  @Prop({ required: true, default: 30 })
  autoCloseTemperature: number; // Nhiệt độ tự động đóng giàn (°C)

  @Prop({ required: true, default: 80 })
  autoCloseHumidity: number; // Độ ẩm tự động đóng giàn (%)

  @Prop({ required: true, default: 200 })
  minLightLevel: number; // Mức ánh sáng tối thiểu (lux)

  @Prop({ required: true, default: true })
  autoCloseOnRain: boolean; // Tự động đóng khi có mưa

  @Prop({ required: true, default: true })
  enableNotifications: boolean; // Bật thông báo

  @Prop({ default: '' })
  email: string; // Email người dùng

  @Prop()
  wifiSSID: string; // SSID WiFi

  @Prop()
  wifiPassword: string; // Password WiFi
}

export const SettingSchema = SchemaFactory.createForClass(Setting);

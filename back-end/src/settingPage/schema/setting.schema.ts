import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SettingDocument = HydratedDocument<Setting>;

@Schema({ timestamps: true })
export class Setting {
  // ===== ĐIỀU KHIỂN TỰ ĐỘNG THU PHÓNG =====
  @Prop({ required: true, default: false })
  autoModeEnabled: boolean; // Bật/tắt chế độ tự động thu phóng theo cảm biến

  // ===== CÀI ĐẶT TỰ ĐỘNG (Chỉ hiển thị khi autoModeEnabled = true) =====
  
  // Ngưỡng độ ẩm
  @Prop({ required: true, default: 80 })
  autoCloseHumidity: number; // Ngưỡng độ ẩm tự động đóng giàn (%)
  
  @Prop({ required: true, default: true })
  useHumidityForAuto: boolean; // Sử dụng độ ẩm để kích hoạt tự động thu phóng
  
  // Cảm biến mưa
  @Prop({ required: true, default: true })
  useRainForAuto: boolean; // Sử dụng cảm biến mưa để kích hoạt tự động thu phóng
  
  // Tự động theo thời gian
  @Prop({ default: false })
  nightRetract: boolean; // Tự động thu vào ban đêm

  // ===== TÙY CHỌN KHÁC =====
  @Prop({ default: false })
  buzzerEnabled: boolean; // Bật/tắt buzzer cảnh báo

  @Prop({ required: true, default: true })
  enableNotifications: boolean; // Bật/tắt thông báo email

  // ===== THÔNG TIN NGƯỜI DÙNG =====
  @Prop({ required: true, default: '' })
  email: string; // Email người dùng

  // ===== WIFI =====
  @Prop({ default: '' })
  wifiSSID: string; // SSID WiFi

  @Prop({ default: '' })
  wifiPassword: string; // Password WiFi
}

export const SettingSchema = SchemaFactory.createForClass(Setting);

import { Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { In4ArduinoModule } from '../modules/in4_arduino/in4_arduino.module';
import { SettingModule } from 'src/settingPage/setting.module';
// import { TelegramModule } from 'src/telegram/telegram.module'; // Vô hiệu hóa telegram
import { UsersModule } from 'src/modules/users/users.module';

@Module({
  imports: [In4ArduinoModule, SettingModule, UsersModule], // Loại bỏ TelegramModule
  providers: [MqttService],
})
export class MqttModule {}

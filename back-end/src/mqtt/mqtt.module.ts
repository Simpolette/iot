import { Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { In4ArduinoModule } from '../modules/in4_arduino/in4_arduino.module';
import { SettingModule } from 'src/settingPage/setting.module';
// import { TelegramModule } from 'src/telegram/telegram.module'; // Vô hiệu hóa telegram
import { UsersModule } from 'src/modules/users/users.module';
import { PushsaferModule } from 'src/pushsafer/pushsafer.module';

@Module({
  imports: [In4ArduinoModule, SettingModule, UsersModule, PushsaferModule], // Thêm PushsaferModule
  providers: [MqttService],
})
export class MqttModule {}

import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { EventPattern, Payload, Ctx, MqttContext, Transport, ClientProxyFactory, ClientProxy } from '@nestjs/microservices';
import { In4ArduinoService } from '../modules/in4_arduino/in4_arduino.service';
import { SettingService } from '../settingPage/setting.service';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { lastValueFrom } from 'rxjs';
import { UsersService } from '../modules/users/users.service';
import { emit } from 'process';

// DTO cho cấu hình gửi đến ESP32 (Giàn phơi thông minh)
class EspConfigDto {
    ssid?: string;
    pass?: string;
    autoCloseTemp?: number;        // Nhiệt độ tự động đóng
    autoCloseHumid?: number;       // Độ ẩm tự động đóng
    minLight?: number;             // Mức ánh sáng tối thiểu
    autoRain?: boolean;            // Tự động đóng khi mưa
    action?: string;               // Lệnh điều khiển: 'open', 'close', 'auto'
}

@Controller()
export class MqttService {
    private mqttPub: ClientProxy;
    constructor(
        private readonly in4ArduinoService: In4ArduinoService,
        private readonly settingService: SettingService,
        private readonly configService: ConfigService,
        private readonly usersService: UsersService,
    ) {
        this.mqttPub = ClientProxyFactory.create({
            transport: Transport.MQTT,
            options: {
                url: this.configService.get<string>('MQTT_URL'),
                username: this.configService.get<string>('MQTT_USERNAME'),
                password: this.configService.get<string>('MQTT_PASSWORD'),
                // Nếu dùng HiveMQ Cloud TLS thì URL phải là mqtts://...:8883
            },
        });
    }
    @Post('esp32/config') // => POST /api/esp32/config (Gửi cấu hình)
    async sendConfig(@Body() dto: any, @Res() res: Response) {
        try {
            console.log('📤 HTTP /esp32/config ->', dto);
            await this.mqttPub.connect();
            console.log('✅ MQTT client connected');
            await lastValueFrom(this.mqttPub.emit('smartdry/config', dto));
            console.log('✅ Published to topic smartdry/config');
            return res.status(200).json({ ok: true });
        } catch (e: any) {
            console.error('❌ MQTT publish failed:', e?.message || e);
            return res.status(502).json({ ok: false, error: String(e?.message || e) });
        }
    }

    @Post('mqtt/control') // => POST /api/mqtt/control (Điều khiển giàn phơi)
    async controlRack(@Body() dto: any, @Res() res: Response) {
        try {
            console.log('📤 HTTP /mqtt/control ->', dto);
            await this.mqttPub.connect();
            console.log('✅ MQTT client connected');
            const payload = {
                action: dto.action, // 'open', 'close', 'auto'
                email: dto.email
            };
            await lastValueFrom(this.mqttPub.emit('smartdry/control', payload));
            console.log('✅ Published to topic smartdry/control:', payload);
            return res.status(200).json({ ok: true, action: dto.action });
        } catch (e: any) {
            console.error('❌ MQTT publish failed:', e?.message || e);
            return res.status(502).json({ ok: false, error: String(e?.message || e) });
        }
    }

    @EventPattern('smartdry/data') // Topic ESP32 publish dữ liệu cảm biến
    async handleMessage(@Payload() data: any, @Ctx() context: MqttContext) {
        console.log('📩 MQTT Received from smartdry/data:', data);
        const payload = typeof data === 'string' ? JSON.parse(data) : data;
        try {
            // Chuyển đổi và xác thực dữ liệu từ ESP32
            const parsedData = {
                temperature: Number(payload.temperature || 0),        // DHT11 - Nhiệt độ (°C)
                humidity: Number(payload.humidity || 0),              // DHT11 - Độ ẩm (%)
                light: Number(payload.light || 0),                    // Cảm biến ánh sáng (lux hoặc 0-4095)
                rainSensor: Boolean(payload.rainSensor || false),     // Cảm biến mưa (true = có mưa)
                rackStatus: String(payload.rackStatus || 'unknown'),  // Trạng thái: 'open', 'closed', 'opening', 'closing'
                rackPosition: Number(payload.rackPosition || 0),      // Vị trí giàn (0-100%)
                email: String(payload.email || ''),
            };

            // Lưu vào MongoDB
            await this.in4ArduinoService.save(parsedData);
            console.log('✅ Dữ liệu giàn phơi đã lưu MongoDB');

            // Lấy ngưỡng cài đặt từ database
            const settings = await this.settingService.getThresholds(1, parsedData.email);
            if (!settings || settings.length === 0) {
                console.log('⚠️ Chưa có cài đặt cho user:', parsedData.email);
                return;
            }

            const userSettings = settings[0];
            const alerts: string[] = [];

            // Kiểm tra điều kiện cảnh báo
            if (parsedData.rainSensor && userSettings.autoCloseOnRain) {
                alerts.push("🌧️ Phát hiện mưa - Cần đóng giàn phơi");
            }
            
            if (parsedData.temperature > userSettings.autoCloseTemperature) {
                alerts.push(`🌡️ Nhiệt độ cao (${parsedData.temperature}°C > ${userSettings.autoCloseTemperature}°C)`);
            }
            
            if (parsedData.humidity > userSettings.autoCloseHumidity) {
                alerts.push(`💧 Độ ẩm cao (${parsedData.humidity}% > ${userSettings.autoCloseHumidity}%)`);
            }
            
            if (parsedData.light < userSettings.minLightLevel) {
                alerts.push(`🌙 Ánh sáng thấp (${parsedData.light} < ${userSettings.minLightLevel} lux)`);
            }

            // Gửi thông báo nếu có cảnh báo
            if (alerts.length > 0) {
                const message =
                    `🚨 Cảnh báo Giàn Phơi Thông Minh:\n\n` +
                    `📊 Dữ liệu hiện tại:\n` +
                    `🌡️ Nhiệt độ: ${parsedData.temperature}°C\n` +
                    `💧 Độ ẩm: ${parsedData.humidity}%\n` +
                    `☀️ Ánh sáng: ${parsedData.light} lux\n` +
                    `🌧️ Mưa: ${parsedData.rainSensor ? 'Có' : 'Không'}\n` +
                    `🎚️ Trạng thái giàn: ${parsedData.rackStatus} (${parsedData.rackPosition}%)\n\n` +
                    `⚠️ Cảnh báo:\n${alerts.join('\n')}`;

                await this.usersService.notifyUser(parsedData.email, message);
                console.log('📧 Đã gửi email cảnh báo đến:', parsedData.email);
            }
        } catch (err) {
            console.error('❌ Lỗi khi xử lý dữ liệu MQTT:', err);
        }
    }
}

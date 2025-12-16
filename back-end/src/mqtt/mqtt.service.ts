import { Body, Controller, Post, Res, Inject } from '@nestjs/common';
import { Response } from 'express';
import { EventPattern, Payload, Ctx, MqttContext, Transport, ClientProxyFactory, ClientProxy } from '@nestjs/microservices';
import { In4ArduinoService } from '../modules/in4_arduino/in4_arduino.service';
import { SettingService } from '../settingPage/setting.service';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { lastValueFrom } from 'rxjs';
import { UsersService } from '../modules/users/users.service';
import { emit } from 'process';
import { Public } from 'src/customize/customize';
import { ActiveUserService } from '../services/active-user.service';

// DTO cho cấu hình gửi đến ESP32 (Giàn phơi thông minh)
class EspConfigDto {
    ssid?: string;
    pass?: string;
    autoMode?: boolean;            // Bật/tắt chế độ tự động
    useHumidity?: boolean;         // Sử dụng độ ẩm cho tự động
    autoCloseHumid?: number;       // Ngưỡng độ ẩm tự động đóng
    useRain?: boolean;             // Sử dụng cảm biến mưa cho tự động
    nightRetract?: boolean;        // Tự động thu vào ban đêm
    buzzer?: boolean;              // Bật/tắt buzzer
    action?: string;               // Lệnh điều khiển: 'OPEN', 'CLOSE', 'STOP'
}

@Controller()
export class MqttService {
    private mqttPub: ClientProxy;
    constructor(
        private readonly in4ArduinoService: In4ArduinoService,
        private readonly settingService: SettingService,
        private readonly configService: ConfigService,
        private readonly usersService: UsersService,
        @Inject(ActiveUserService) private readonly activeUserService: ActiveUserService,
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
    @Public()
    @Post('esp32/config') // => POST /api/esp32/config (Gửi cấu hình)
    async sendConfig(@Body() dto: any, @Res() res: Response) {
        try {
            console.log('📤 HTTP /esp32/config ->', dto);
            await this.mqttPub.connect();
            console.log('✅ MQTT client connected');
            await lastValueFrom(this.mqttPub.emit('device/control', dto));
            console.log('✅ Published to topic device/control');
            return res.status(200).json({ ok: true });
        } catch (e: any) {
            console.error('❌ MQTT publish failed:', e?.message || e);
            return res.status(502).json({ ok: false, error: String(e?.message || e) });
        }
    }

    @Public()
    @Post('mqtt/control') // => POST /api/mqtt/control (Điều khiển giàn phơi)
    async controlRack(@Body() dto: any, @Res() res: Response) {
        try {
            console.log('📤 HTTP /mqtt/control ->', dto);
            await this.mqttPub.connect();
            console.log('✅ MQTT client connected');
            // Chuyển action sang uppercase để khớp với ESP32 (OPEN, CLOSE, STOP)
            const actionUppercase = dto.action?.toUpperCase() || 'STOP';
            const payload = {
                action: actionUppercase
            };
            await lastValueFrom(this.mqttPub.emit('device/control', payload));
            console.log('✅ Published to topic device/control:', payload);
            return res.status(200).json({ ok: true, action: actionUppercase });
        } catch (e: any) {
            console.error('❌ MQTT publish failed:', e?.message || e);
            return res.status(502).json({ ok: false, error: String(e?.message || e) });
        }
    }

    @EventPattern('sensor/status') // Topic ESP32 publish dữ liệu cảm biến
    async handleMessage(@Payload() data: any, @Ctx() context: MqttContext) {
        console.log('📩 MQTT Received from sensor/status:', data);
        const payload = typeof data === 'string' ? JSON.parse(data) : data;
        try {
            // 🔄 Lấy email của active user (user vừa login gần nhất)
            const activeEmail = this.activeUserService.getActiveUserEmail();
            
            // Ưu tiên:
            // 1. Email từ ESP32 payload (nếu có)
            // 2. Email của user đã login (active email)
            const userEmail = payload.email || activeEmail;
            
            console.log(`📧 Email strategy:`);
            console.log(`   - Payload email: ${payload.email || 'không có'}`);
            console.log(`   - Active email (user đã login): ${activeEmail}`);
            console.log(`   - ✅ Sử dụng email: ${userEmail}`);
            
            // Map fields từ ESP32 (temp, hum, raining, state) sang format database
            const parsedData = {
                temperature: Number(payload.temp || payload.temperature || 0),        // DHT11 - Nhiệt độ (°C)
                humidity: Number(payload.hum || payload.humidity || 0),              // DHT11 - Độ ẩm (%)
                light: Number(payload.light || 0),                    // Cảm biến ánh sáng (lux hoặc 0-4095)
                rainSensor: Boolean(payload.raining || payload.rainSensor || false),     // Cảm biến mưa (true = có mưa)
                rackStatus: String(payload.state || payload.rackStatus || 'STOPPED').toLowerCase(),  // Trạng thái: OPENING, CLOSING, STOPPED
                rackPosition: Number(payload.rackPosition || 0),      // Vị trí giàn (0-100%)
                email: userEmail,  // ✅ Email mặc định là email đã đăng nhập
            };

            // Lưu vào MongoDB
            await this.in4ArduinoService.save(parsedData);
            console.log(`✅ Dữ liệu đã lưu MongoDB (email: ${userEmail})`);

            // Lấy ngưỡng cài đặt từ database
            const settings = await this.settingService.getThresholds(1, userEmail);
            if (!settings || settings.length === 0) {
                console.log(`⚠️ Chưa có cài đặt cho user: ${userEmail}`);
                console.log('💡 Tip: User cần vào trang Settings để cấu hình ngưỡng');
                return;
            }

            const userSettings = settings[0];
            const alerts: string[] = [];

            // Kiểm tra điều kiện cảnh báo (chỉ khi autoMode bật)
            if (userSettings.autoModeEnabled) {
                // Kiểm tra cảm biến mưa (nếu bật sử dụng)
                if (parsedData.rainSensor && userSettings.useRainForAuto) {
                    alerts.push("🌧️ Phát hiện mưa - Cần đóng giàn phơi");
                }
                
                // Kiểm tra độ ẩm (nếu bật sử dụng)
                if (userSettings.useHumidityForAuto && parsedData.humidity > userSettings.autoCloseHumidity) {
                    alerts.push(`💧 Độ ẩm cao (${parsedData.humidity}% > ${userSettings.autoCloseHumidity}%)`);}
            }

            // Gửi thông báo nếu có cảnh báo VÀ người dùng bật enableNotifications
            if (alerts.length > 0 && userSettings.enableNotifications) {
                const message =
                    `🚨 Cảnh báo Giàn Phơi Thông Minh:\n\n` +
                    `📊 Dữ liệu hiện tại:\n` +
                    `🌡️ Nhiệt độ: ${parsedData.temperature}°C\n` +
                    `💧 Độ ẩm: ${parsedData.humidity}%\n` +
                    `☀️ Ánh sáng: ${parsedData.light} lux\n` +
                    `🌧️ Mưa: ${parsedData.rainSensor ? 'Có' : 'Không'}\n` +
                    `🎚️ Trạng thái giàn: ${parsedData.rackStatus} (${parsedData.rackPosition}%)\n\n` +
                    `⚠️ Cảnh báo:\n${alerts.join('\n')}`;

                await this.usersService.notifyUser(userEmail, message);
                console.log(`📧 Đã gửi email cảnh báo đến: ${userEmail}`);
            }
        } catch (err) {
            console.error('❌ Lỗi khi xử lý dữ liệu MQTT:', err);
        }
    }
}

export class CreateIn4ArduinoDto {
    temperature: number; // Nhiệt độ (°C)
    humidity: number; // Độ ẩm (%)
    light: number; // Ánh sáng (lux)
    rainSensor: boolean; // Cảm biến mưa
    rackStatus: string; // Trạng thái giàn phơi ('open', 'close')
    email?: string; // Email người dùng
    predict?: boolean; // Mưa = 1, Không mưa = 0
}

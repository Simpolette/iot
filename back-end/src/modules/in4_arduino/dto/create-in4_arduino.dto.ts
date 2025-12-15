export class CreateIn4ArduinoDto {
    temperature: number; // Nhiệt độ (°C)
    humidity: number; // Độ ẩm (%)
    light: number; // Ánh sáng (lux)
    rainSensor: boolean; // Cảm biến mưa
    rackStatus: string; // Trạng thái giàn phơi
    rackPosition?: number; // Vị trí giàn phơi (0-100%)
    email?: string; // Email người dùng
}

# Hệ Thống Giàn Phơi Thông Minh - Smart Drying Rack

## Mô tả dự án
Website quản lý và điều khiển giàn phơi thông minh với các tính năng:
- **Giám sát thời gian thực**: Nhiệt độ, độ ẩm, ánh sáng, cảm biến mưa
- **Điều khiển tự động**: Tự động đóng/mở giàn phơi dựa trên điều kiện thời tiết
- **Thông báo email**: Cảnh báo khi có mưa hoặc điều kiện bất thường
- **Dashboard**: Xem biểu đồ và lịch sử hoạt động
- **Cài đặt linh hoạt**: Tùy chỉnh ngưỡng tự động

## Công nghệ sử dụng

### Back-end
- **Framework**: NestJS (Node.js)
- **Database**: MongoDB Atlas
- **Authentication**: JWT (JSON Web Token)
- **Email**: NodeMailer với Handlebars templates
- **MQTT**: Giao tiếp với thiết bị IoT (ESP32/Arduino)

### Front-end
- **HTML5, CSS3, JavaScript (Vanilla JS)**
- **Chart.js**: Biểu đồ thống kê
- **Font Awesome**: Icons

## Cấu trúc Database

### Collection 1: users
Lưu trữ thông tin người dùng:
```javascript
{
  name: String,
  email: String,
  password: String (hashed),
  role: String (default: 'user'),
  isActive: Boolean,
  codeID: String,
  codeExpire: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Collection 2: in4_arduino
Lưu trữ dữ liệu cảm biến:
```javascript
{
  temperature: Number,      // Nhiệt độ (°C)
  humidity: Number,         // Độ ẩm (%)
  light: Number,            // Ánh sáng (lux)
  rainSensor: Boolean,      // Cảm biến mưa
  rackStatus: String,       // Trạng thái giàn ('open', 'closed', 'opening', 'closing')
  rackPosition: Number,     // Vị trí giàn (0-100%)
  email: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Collection 3: settings
Lưu trữ cài đặt người dùng:
```javascript
{
  autoCloseTemperature: Number,  // Nhiệt độ tự động đóng (°C)
  autoCloseHumidity: Number,     // Độ ẩm tự động đóng (%)
  minLightLevel: Number,         // Mức ánh sáng tối thiểu (lux)
  autoCloseOnRain: Boolean,      // Tự động đóng khi mưa
  enableNotifications: Boolean,   // Bật thông báo
  email: String,
  wifiSSID: String,
  wifiPassword: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Hướng dẫn cài đặt và chạy

### Bước 1: Cài đặt dependencies

#### Back-end
```bash
cd back-end
npm install
```

#### Front-end
Front-end sử dụng vanilla JavaScript, không cần cài đặt dependencies.

### Bước 2: Cấu hình môi trường

File `.env` đã được cấu hình với thông tin sau:

```env
PORT=8080
MONGODB_URI=mongodb+srv://23127107:mongo23127107@cluster0.lhelwyd.mongodb.net/smartdry?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=b93256d7-0f8e-4b46-be20-81d9cb2d6c25
JWT_EXPIRATION=1d
MAIL_USER=nptho23@clc.fitus.edu.vn
MAIL_PASSWORD=llvfsnsldhrebgea
MQTT_URL=mqtts://195d12f952ea4bbba0db56a9e044028f.s1.eu.hivemq.cloud:8883
MQTT_USERNAME=NPT100
MQTT_PASSWORD=Phuctho100
```

**Lưu ý**: 
- Database URL đã được cập nhật theo yêu cầu
- Telegram bot đã bị vô hiệu hóa (không cần TELEGRAM_BOT_TOKEN)

### Bước 3: Chạy Back-end

```bash
cd back-end
npm run dev
```

Server sẽ chạy tại: `http://localhost:8080`

### Bước 4: Chạy Front-end

Front-end cần chạy qua web server. Bạn có thể sử dụng:

#### Cách 1: Live Server (VS Code Extension)
1. Cài đặt extension "Live Server" trong VS Code
2. Mở folder `front-end`
3. Click phải vào file `pages/index.html`
4. Chọn "Open with Live Server"

#### Cách 2: Python HTTP Server
```bash
cd front-end
python -m http.server 5500
```

#### Cách 3: Node.js HTTP Server
```bash
# Cài đặt http-server global
npm install -g http-server

cd front-end
http-server -p 5500
```

Sau đó truy cập: `http://localhost:5500/pages/index.html`

## Hướng dẫn sử dụng

### 1. Đăng ký tài khoản
1. Truy cập trang chủ
2. Click "Đăng ký"
3. Điền thông tin: tên, email, mật khẩu
4. Nhận mã xác thực qua email
5. Nhập mã xác thực để kích hoạt tài khoản

### 2. Đăng nhập
1. Sử dụng email và mật khẩu đã đăng ký
2. Hệ thống sẽ chuyển đến Dashboard

### 3. Dashboard
- **Xem dữ liệu thời gian thực**: Nhiệt độ, độ ẩm, ánh sáng, mưa, trạng thái giàn
- **Điều khiển giàn phơi**: 
  - Mở giàn (nút "Mở giàn")
  - Đóng giàn (nút "Đóng giàn")
  - Chế độ tự động (nút "Tự động")
- **Xem biểu đồ**: Thống kê theo thời gian
- **Lịch sử**: Bảng hiển thị 10 hoạt động gần nhất

### 4. Cài đặt
- **Ngưỡng tự động**:
  - Nhiệt độ tự động đóng
  - Độ ẩm tự động đóng
  - Mức ánh sáng tối thiểu
- **Tùy chọn**:
  - Bật/tắt tự động đóng khi mưa
  - Bật/tắt thông báo email
- **Cài đặt WiFi**: 
  - SSID và Password cho ESP32/Arduino

### 5. Profile
- Xem và cập nhật thông tin cá nhân
- Thay đổi mật khẩu

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/verify` - Xác thực email

### Dữ liệu cảm biến
- `GET /api/in4-arduino` - Lấy tất cả dữ liệu
- `GET /api/in4-arduino/:email/latest?limit=100` - Lấy dữ liệu gần nhất
- `POST /api/in4-arduino` - Tạo dữ liệu mới (từ ESP32)

### Cài đặt
- `GET /api/settings/:email/get?limit=1` - Lấy cài đặt
- `POST /api/settings/:email/create` - Tạo/cập nhật cài đặt

### MQTT
- `POST /api/mqtt/control` - Điều khiển giàn phơi
- `POST /api/mqtt/config` - Gửi cấu hình đến ESP32

### Users
- `GET /api/users/:email` - Lấy thông tin user
- `POST /api/users/update` - Cập nhật thông tin user

## Tích hợp với ESP32/Arduino

### MQTT Topics
- **Subscribe** (ESP32 nhận lệnh):
  - `smartdry/control` - Điều khiển giàn (open/close/auto)
  - `smartdry/config` - Cấu hình (ngưỡng, WiFi)

- **Publish** (ESP32 gửi dữ liệu):
  - `smartdry/data` - Dữ liệu cảm biến

### Định dạng dữ liệu gửi từ ESP32
```json
{
  "temperature": 28.5,
  "humidity": 65,
  "light": 850,
  "rainSensor": false,
  "rackStatus": "open",
  "rackPosition": 100,
  "email": "user@example.com"
}
```

## Troubleshooting

### Lỗi kết nối database
- Kiểm tra MONGODB_URI trong file `.env`
- Đảm bảo IP của bạn đã được whitelist trên MongoDB Atlas

### Lỗi CORS
- Đảm bảo back-end đã enable CORS cho `http://localhost:5500`
- Kiểm tra file `main.ts` trong back-end

### Lỗi không nhận được email
- Kiểm tra MAIL_USER và MAIL_PASSWORD trong `.env`
- Kiểm tra spam folder

### Lỗi MQTT
- Kiểm tra MQTT_URL, MQTT_USERNAME, MQTT_PASSWORD
- Đảm bảo HiveMQ cluster đang hoạt động

## Tính năng đã loại bỏ
- ❌ Telegram Bot (đã comment out trong code)
- ❌ Deploy production (cấu hình cho local)

## Tính năng có thể mở rộng
- ✅ Thêm nhiều người dùng
- ✅ Lịch sử chi tiết hơn
- ✅ Thống kê theo ngày/tuần/tháng
- ✅ Cảnh báo SMS
- ✅ Tích hợp AI dự đoán thời tiết
- ✅ Mobile App

## Liên hệ & Hỗ trợ
- Email: nptho23@clc.fitus.edu.vn

---

**Chúc bạn sử dụng thành công! 🎉**

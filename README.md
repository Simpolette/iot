# Hệ Thống Giàn Phơi Thông Minh - Smart Drying Rack

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
MONGODB_URI=YOUR_URL
JWT_SECRET=YOUR_TOKEN
JWT_EXPIRATION=
MAIL_USER=YOUR_EMAIL
MAIL_PASSWORD=YOUR_APP_PASSWORD_EMAIL
MQTT_URL=YOUR_MQTT_URL
MQTT_USERNAME=
MQTT_PASSWORD=
```

### Bước 3: Chạy Back-end

```bash
cd back-end
npm run dev
```

Server sẽ chạy tại: `http://localhost:8080`

### Bước 4: Chạy Front-end

Front-end cần chạy qua web server. Bạn có thể sử dụng:

#### Node.js HTTP Server
```bash
# Cài đặt http-server global
npm install -g http-server

cd front-end
http-server -p 5500
```

Sau đó truy cập: `http://localhost:5500/pages/index.html`


**Chúc bạn sử dụng thành công! 🎉**

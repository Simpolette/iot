# 🔥 FireGuard Backend Setup

Đây là hướng dẫn từng bước để thiết lập và chạy **backend** cho hệ thống FireGuard sử dụng **MongoDB** và **Docker**.

---

##  1. Yêu cầu hệ thống

Trước khi bắt đầu, hãy đảm bảo bạn đã cài đặt:

- [Node.js](https://nodejs.org/) (phiên bản mới nhất)
- [Docker](https://www.docker.com/) & Docker Compose
- [MongoDB Compass](https://www.mongodb.com/products/compass)

---

##  2. Clone dự án

git clone https://github.com/your-username/fireguard.git
cd fireguard/back-end

##  3. Set up database
- Chạy lệnh để kết nối với docker: docker compose -p <your name project> up -d
- Trong MongoDB Compass:
+ Add new connection
+ Trong URI sửa path thành: mongodb://<username của mongo>:<password của mongo>@localhost:27017/<tên lưu trong docker>?authSource=admin
+ Trong file docker-compose.yml sửa username và passwork thành của mình
+ Trong file .env sửa path của MONGODB_URI thành mongodb://<username của mongo>:<password của mongo>@localhost:27017/<tên lưu trong docker>?authSource=admin

## 4. Tải thư viện
- Gõ lệnh:npm i

## 5. Khởi chạy
- Gỡ lệnh: npm run dev

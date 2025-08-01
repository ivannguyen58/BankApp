# VietBank Mobile - Demo Banking Application

Ứng dụng ngân hàng di động demo được xây dựng với Node.js, Express và EJS.

## 🚀 Tính năng

- ✅ Đăng nhập/Đăng ký multi-user
- ✅ Dashboard với số dư tài khoản
- ✅ Chuyển tiền giữa các tài khoản
- ✅ Thanh toán NFC mô phỏng
- ✅ Xác thực KYC
- ✅ Responsive design
- ✅ Session management
- ✅ Password hashing
- ✅ Real-time balance updates

## 📋 Yêu cầu hệ thống

- Node.js >= 14.0.0
- npm >= 6.0.0

## 🛠️ Cài đặt

1. **Clone hoặc tạo thư mục dự án:**
```bash
mkdir vietbank-mobile
cd vietbank-mobile
```

2. **Tạo cấu trúc thư mục:**
```bash
mkdir -p models routes views/auth views/banking public/css public/js public/images middleware utils config logs
```

3. **Khởi tạo dự án:**
```bash
npm init -y
```

4. **Cài đặt dependencies:**
```bash
npm install express express-session bcryptjs body-parser ejs uuid
npm install --save-dev nodemon
```

5. **Copy tất cả các file code vào đúng vị trí**

6. **Chạy ứng dụng:**
```bash
# Development mode
npm run dev

# Production mode  
npm start
```

7. **Truy cập:** http://localhost:3000

## 👥 Tài khoản demo

| Username | Password | STK | Số dư |
|----------|----------|-----|-------|
| user1 | password123 | 1234567890 | 2,458,000 VNĐ |
| user2 | password123 | 0987654321 | 1,850,000 VNĐ |
| admin | admin123 | 1111222333 | 50,000,000 VNĐ |

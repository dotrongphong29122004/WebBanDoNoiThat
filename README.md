# NoiThat - Website Cửa Hàng Nội Thất Trực Tuyến

Dự án Website bán hàng nội thất trực tuyến. Hệ thống bao gồm Frontend giao diện người dùng/admin và Backend cung cấp các API xử lý dữ liệu với cơ sở dữ liệu SQL Server.

## Công nghệ sử dụng

### Frontend
* **Ngôn ngữ:** HTML5, CSS3, Vanilla JavaScript (ES6+).
* **Styling:** Tailwind CSS (qua CDN).
* **Icons:** Lucide Icons.
* **Cấu trúc:** Sử dụng Javascript để render các components dùng chung (Header, Footer, Sidebar).

### Backend
* **Môi trường:** Node.js.
* **Framework:** Express.js (dựa trên cấu trúc thư mục routers, controllers).
* **Cơ sở dữ liệu:** Microsoft SQL Server (MSSQL).
* **Xác thực (Authentication):** JSON Web Token (JWT).
* **Công cụ khác:** Nodemon (môi trường dev).

## Cấu trúc thư mục (Folder Structure)

Dự án được chia thành 2 phần độc lập:

```text
├── Backend/               # Chứa mã nguồn API Server
│   ├── src/
│   │   ├── controllers/   # Xử lý logic cho các endpoint
│   │   ├── database/      # Chứa file kết nối DB, migrate và seed dữ liệu
│   │   ├── middlewares/   # Xử lý trung gian (Auth, Error Handler, Upload)
│   │   ├── routes/        # Định nghĩa các API endpoints
│   │   └── services/      # Xử lý logic truy vấn dữ liệu chính
│   ├── .env               # Chứa các biến môi trường (port, db config, jwt secret)
│   ├── package.json       # Chứa các thư viện Node.js
│   └── server.js          # File khởi chạy server
│
└── Frontend/              # Chứa giao diện website
    ├── assets/
    │   └── js/            # Chứa các file logic JS (api.js, main.js, phân chia theo page)
    ├── components/        # Chứa các file HTML tĩnh dùng chung (header, footer...)
    ├── admin.html         # Giao diện quản trị viên
    ├── index.html         # Trang chủ
    ├── products.html      # Trang danh sách sản phẩm
    ├── cart.html          # Giỏ hàng
    └── checkout.html      # Thanh toán

## Hướng dẫn Cài đặt & Khởi chạy (Local Development)
1. Yêu cầu hệ thống (Prerequisites)
Đã cài đặt Node.js (Khuyến nghị bản LTS).
Đã cài đặt SQL Server và công cụ quản lý như SQL Server Management Studio (SSMS).
VS Code với extension Live Server (để chạy Frontend).

2. Thiết lập cơ sở dữ liệu (Database Setup)
Mở SQL Server.
Tạo một cơ sở dữ liệu mới có tên là NoiThatDB.
(Tùy chọn) Nếu dự án có tính năng tự động tạo bảng, bạn có thể chạy file migrate ở bước backend phía dưới.

3. Khởi chạy Backend
Mở terminal và di chuyển vào thư mục Backend:
cd Backend

Cài đặt các gói thư viện (dependencies):
npm install

##Tạo file .env ở thư mục gốc của Backend (dựa theo file .env.example nếu có) và cấu hình thông tin:
Đoạn mã
PORT=5000
NODE_ENV=development
CLIENT_URL=[http://127.0.0.1:5500](http://127.0.0.1:5500)

DB_SERVER=TÊN_SERVER_CỦA_BẠN\ROOT (ví dụ: localhost)
DB_PORT=1433
DB_NAME=NoiThatDB
DB_USER=sa
DB_PASSWORD=mật_khẩu_sql_server_của_bạn
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true

JWT_SECRET=thay_bang_chuoi_bi_mat_cua_ban
JWT_EXPIRES_IN=7d

*(Nếu cần) Chạy script để tạo bảng và nạp dữ liệu mẫu (dựa vào cấu trúc thư mục của bạn):
node src/database/migrate.js
node src/database/seed.js

Khởi chạy server ở chế độ phát triển:
npm run dev
Terminal hiển thị Kết nối thành công! DB: NoiThatDB và NoiThat Backend đang chạy! là thành công.

4. Khởi chạy Frontend
Do Frontend sử dụng các file js dạng module và gọi component HTML từ bên ngoài -> không thể mở trực tiếp file index.html bằng trình duyệt (sẽ bị lỗi CORS/file protocol).
Mở thư mục Frontend bằng VS Code.
Click chuột phải vào file index.html và chọn "Open with Live Server".
Website sẽ tự động mở lên tại địa chỉ: http://127.0.0.1:5500 (Địa chỉ này phải khớp với CLIENT_URL trong file .env của Backend để tránh lỗi CORS khi gọi API).

# 📌 Mini Trello - Ứng Dụng Quản Lý Công Việc

Mini Trello là một bản clone của Trello được xây dựng bằng **Laravel** (Backend) và **React** (Frontend), cho phép người dùng tạo và quản lý các boards, columns, cards với khả năng mời thành viên vào board.

---

## 📋 Yêu Cầu Hệ Thống

### Backend (Laravel)

- **PHP**: `^8.2` trở lên (khuyến nghị 8.2 hoặc 8.3)
- **Composer**: v2.x trở lên
- **MySQL/MariaDB**: 5.7 trở lên
- **Extensions**: `curl`, `json`, `mbstring`, `tokenizer`, `xml`, `bcmath`

### Frontend (React + Vite)

- **Node.js**: `>=18.x` trở lên (khuyến nghị 18.x hoặc 20.x)
- **npm**: v9.x trở lên

### Công Cụ Khác

- **Git**: Để clone repository
- **Code Editor**: VS Code (khuyến nghị)

---

## 🚀 Hướng Dẫn Cài Đặt

### Bước 1: Clone Repository

```bash
git clone https://github.com/Henry-Tran-7198/Mini-Trello/tree/mini_trello
cd Mini-Trello
```

### Bước 2: Cài Đặt Backend (Laravel)

#### 2.1 Cài đặt Dependencies

```bash
cd _Backend
composer install
```

#### 2.2 Tạo File `.env`

```bash
cp .env.example .env
```

Hoặc tạo file `.env` và cấu hình:

```env
APP_NAME=MiniTrello
APP_ENV=local
APP_KEY=base64:YOUR_APP_KEY_HERE
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database Configuration
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mini_trello
DB_USERNAME=root
DB_PASSWORD=

# Frontend URL (cho CORS)
FRONTEND_URL=http://localhost:5173
```

#### 2.3 Generate App Key

```bash
php artisan key:generate
```

#### 2.4 Tạo Database

```bash
# Tạo database trước (nếu chưa tạo)
mysql -u root -p -e "CREATE DATABASE mini_trello;"
```

#### 2.5 Chạy Migration (Tạo Bảng)

```bash
php artisan migrate
```

#### 2.6 Seed Data (Tuỳ Chọn - Tạo Dữ Liệu Mẫu)

```bash
php artisan db:seed
```

**Hoặc tạo test user thủ công:**

```bash
php artisan tinker

# Trong tinker shell:
App\Models\User::create([
    'username' => 'testuser',
    'email' => 'test@example.com',
    'password' => bcrypt('password123'),
    'avatar' => 'https://i.pravatar.cc/150?u=test@example.com'
]);

exit
```

#### 2.7 Khởi Động Backend Server

```bash
php artisan serve
```

Server sẽ chạy tại `http://localhost:8000`

---

### Bước 3: Cài Đặt Frontend (React)

#### 3.1 Cài đặt Dependencies

```bash
cd Mini-Trello
npm install
```

#### 3.2 Cấu Hình API URL (Tuỳ Chọn)

File: `src/api/axiosInstance.js` hoặc `.env`

Đảm bảo API URL trỏ tới backend:

```javascript
const API_BASE_URL = "http://localhost:8000/api";
```

#### 3.3 Khởi Động Frontend Server (Dev)

```bash
npm run dev
```

Server sẽ chạy tại `http://localhost:5173` (hoặc port tiếp theo nếu port bận)

---

## 💻 Cách Sử Dụng

### 1. Đăng Nhập

1. Mở `http://localhost:5173` trong trình duyệt
2. Click "Đăng Nhập"
3. Nhập credentials:
   - **Email**: `test@example.com` (hoặc email user bạn tạo)
   - **Password**: `password123` (hoặc password bạn set)
4. Click "Đăng Nhập"

### 2. Tạo Board

- Từ trang chủ (Danh sách Boards), click nút **"+ Tạo Board"** ở AppBar
- Điền thông tin:
  - **Tên Board**: Tên của board
  - **Mô Tả**: Mô tả board (tuỳ chọn)
- Click **"Tạo"** để tạo board mới

### 3. Quản Lý Columns (Cột)

**Thêm Column:**

- Click nút **"+ Thêm Column"** ở cuối dòng
- Nhập tên column
- Click **"Tạo"**

**Sửa Column:**

- Click nút **"✎"** (sửa) trên column
- Chỉnh sửa thông tin
- Click **"Cập Nhật"**

**Xóa Column:**

- Click nút **"🗑️"** (xóa) trên column
- Xác nhận xóa

### 4. Quản Lý Cards (Thẻ)

**Thêm Card:**

- Click nút **"+ Thêm Card"** trong column
- Nhập tên card
- Click **"Tạo"**

**Sửa Card:**

- Click nút **"✎"** (sửa) trên card
- Chỉnh sửa thông tin
- Click **"Cập Nhật"**

**Xóa Card:**

- Click nút **"🗑️"** (xóa) trên card
- Xác nhận xóa

### 5. Quản Lý Thành Viên (Members)

**Mời Thành Viên:**

- Click nút **"👥 Mời"** ở BoardBar (thanh trên board)
- Gõ username hoặc email user cần mời
- Click user trong danh sách kết quả
- User sẽ được thêm vào board

**Xóa Thành Viên:**

- Click nút **"👥 Mời"** ở BoardBar
- Ở danh sách "Hiện tại", click nút **"X"** trên chip thành viên
- Thành viên sẽ bị xóa khỏi board

**Lưu Ý:**

- Chỉ **Owner** có thể mời/xóa thành viên
- Không thể xóa Owner khỏi board

---

## 📁 Cấu Trúc Dự Án

```
Mini-Trello/
├── _Backend/                      # Laravel Backend
│   ├── app/
│   │   ├── Http/Controllers/Api/  # API Controllers
│   │   ├── Models/                # Eloquent Models
│   │   └── Providers/             # Service Providers
│   ├── database/
│   │   ├── migrations/            # Database migrations
│   │   └── seeders/               # Database seeders
│   ├── routes/api.php             # API routes
│   ├── .env                       # Environment config
│   └── composer.json              # PHP dependencies
│
└── Mini-Trello/                   # React Frontend
    ├── src/
    │   ├── api/                   # API calls
    │   ├── components/            # React components
    │   ├── pages/                 # Page components
    │   ├── redux/                 # State management
    │   ├── routes/                # Router config
    │   └── main.jsx               # Entry point
    ├── public/                    # Static assets
    ├── .env                       # Environment config
    ├── vite.config.js             # Vite config
    └── package.json               # JS dependencies
```

---

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/register` - Đăng ký user mới
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất

### Boards

- `GET /api/boards` - Lấy danh sách boards
- `POST /api/boards` - Tạo board mới
- `GET /api/boards/{id}` - Lấy chi tiết board
- `PUT /api/boards/{id}` - Cập nhật board
- `DELETE /api/boards/{id}` - Xóa board

### Columns

- `POST /api/columns` - Tạo column
- `PUT /api/columns/{id}` - Cập nhật column
- `DELETE /api/columns/{id}` - Xóa column

### Cards

- `POST /api/cards` - Tạo card
- `PUT /api/cards/{id}` - Cập nhật card
- `DELETE /api/cards/{id}` - Xóa card

### Members

- `GET /api/boards/{id}/members` - Lấy danh sách members
- `POST /api/boards/{id}/invite` - Mời member
- `DELETE /api/boards/{id}/members/{userId}` - Xóa member
- `GET /api/users/search?query=...` - Tìm kiếm users

---

## 🔐 Authentication

App sử dụng **Bearer Token** với cơ chế tự tạo (không dùng Sanctum).

**Cách hoạt động:**

1. User đăng nhập → Server tạo token ngẫu nhiên 80 ký tự
2. Token được lưu trong `localStorage` của browser
3. Mỗi request API sẽ gửi token trong header: `Authorization: Bearer <token>`
4. Server xác minh token và trả về response

---

## 🚧 Troubleshooting

### Lỗi: "Cannot find module 'react'"

```bash
cd Mini-Trello
npm install
```

### Lỗi: "Column 'role' in where clause is ambiguous"

Đã fix bằng `wherePivot()` method. Nếu vẫn gặp, update Laravel framework:

```bash
cd _Backend
composer update laravel/framework
```

### Lỗi: "CORS policy"

Kiểm tra file `.env` backend:

```env
FRONTEND_URL=http://localhost:5173
```

Và file `config/cors.php` có `'supports_credentials' => true`

### Lỗi: "Connection refused" (Database)

1. Kiểm tra MySQL đang chạy
2. Kiểm tra cấu hình `.env`:
   ```env
   DB_HOST=127.0.0.1
   DB_DATABASE=mini_trello
   DB_USERNAME=root
   DB_PASSWORD=
   ```

### Port 5173 đang bận

Vite sẽ tự chọn port khác (5174, 5175, ...). Kiểm tra console output.

---

## 📝 Database Schema

### Users Table

- `id` - Primary key
- `username` - Username
- `email` - Email
- `password` - Password (hashed)
- `avatar` - Avatar URL
- `created_at`, `updated_at`

### Boards Table

- `id` - Primary key
- `user_id` - Owner ID
- `title` - Board title
- `description` - Board description
- `type` - Board type
- `created_at`, `updated_at`, `deleted_at` (soft delete)

### Columns Table

- `id` - Primary key
- `board_id` - Board ID
- `title` - Column title
- `order` - Column position
- `created_at`, `updated_at`, `deleted_at`

### Cards Table

- `id` - Primary key
- `column_id` - Column ID
- `title` - Card title
- `description` - Card description
- `order` - Card position
- `created_at`, `updated_at`, `deleted_at`

### Board_Users Table (Many-to-Many)

- `board_id` - Board ID
- `user_id` - User ID
- `role` - Role (owner/member)
- `created_at`

---

## 🛠️ Commands Hữu Ích

### Backend

```bash
# Chạy migrations
php artisan migrate

# Rollback migrations
php artisan migrate:rollback

# Tạo model + migration + controller
php artisan make:model ModelName -mcr

# Xóa database và tạo lại
php artisan migrate:refresh

# Seed database
php artisan db:seed

# Tinker (Interactive shell)
php artisan tinker
```

### Frontend

```bash
# Dev server
npm run dev

# Build for production
npm run build

# Preview build
npm run preview

# Linting (check code quality)
npm run lint
```

---

## 🌐 URLs

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:8000/api`
- **PHPMyAdmin**: `http://localhost/phpmyadmin` (nếu cài XAMPP)

---

## 📧 Test Account

Nếu chạy seeder:

- **Email**: `test@example.com`
- **Password**: `password123`

---

## 📚 Công Nghệ Sử Dụng

### Backend

- **Laravel 12** - PHP Framework
- **MySQL** - Database
- **Eloquent ORM** - Database abstraction
- **Custom Token System** - Authentication

### Frontend

- **React 18** - UI Framework
- **Vite 7** - Build tool
- **Material-UI 5** - Component library
- **Axios** - HTTP client
- **@dnd-kit** - Drag & drop
- **React Router 7** - Routing

---

## 👨‍💻 Phát Triển

### Thêm Feature Mới

1. Tạo migration (backend):

```bash
php artisan make:migration create_table_name
```

2. Tạo component (frontend):

```bash
# React components: src/components/ComponentName.jsx
# Pages: src/pages/PageName.jsx
```

3. Test changes

4. Commit & push

---

## 📞 Support

Nếu gặp vấn đề:

1. Kiểm tra logs:
   - Backend: `_Backend/storage/logs/laravel.log`
   - Frontend: Browser console (F12)
2. Kiểm tra terminal output của dev servers
3. Xóa cache: `npm cache clean --force` (frontend)

---

## 📄 License

MIT License - Tự do sử dụng và sửa đổi

---

**Chúc bạn sử dụng ứng dụng vui vẻ! 🎉**

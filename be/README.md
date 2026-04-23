# 247 Golang API

REST API boilerplate menggunakan Go dengan fitur autentikasi lengkap, Dynamic RBAC (Role-Based Access Control), dan sistem menu hierarki.

## Teknologi

- **Go 1.22** - Bahasa pemrograman
- **Gin** - HTTP web framework
- **GORM** - ORM library
- **PostgreSQL 16** - Database utama
- **Redis 7** - Caching & penyimpanan token
- **JWT** - Token autentikasi
- **Air** - Hot reload untuk development
- **Swagger** - Dokumentasi API interaktif
- **Docker Compose** - PostgreSQL & Redis

## Fitur

- Autentikasi lengkap (login, logout, refresh token, ganti password)
- JWT access token + refresh token disimpan di Redis
- Dynamic RBAC (Role-Based Access Control)
- Sistem menu hierarki yang terfilter berdasarkan permission user
- Superadmin bypass semua pengecekan permission
- Permission di-cache di Redis untuk performa
- Response API dengan pagination
- Auto migrasi SQL saat startup (file baru otomatis dijalankan, yang sudah pernah di-skip)
- File migrasi SQL lengkap dengan seed data
- Swagger UI untuk dokumentasi API interaktif
- Clean architecture (handler -> service -> repository)

## Struktur Project

```
247-golang-api/
├── cmd/
│   └── main.go              # Entry point aplikasi
├── config/
│   └── config.go            # Loader konfigurasi
├── database/
│   ├── database.go          # Koneksi PostgreSQL & Redis
│   └── migrator.go          # Auto migrasi file SQL
├── docs/                     # Swagger generated docs (auto)
│   ├── docs.go
│   ├── swagger.json
│   └── swagger.yaml
├── handlers/                 # HTTP request handler
│   ├── auth_handler.go
│   ├── user_handler.go
│   ├── role_handler.go
│   ├── permission_handler.go
│   └── menu_handler.go
├── middleware/
│   ├── auth.go              # Middleware autentikasi JWT
│   └── rbac.go              # Middleware Dynamic RBAC
├── migrations/               # File migrasi SQL
│   ├── 000001_create_permissions_table.up.sql
│   ├── 000002_create_roles_table.up.sql
│   ├── 000003_create_users_table.up.sql
│   ├── 000004_create_menus_table.up.sql
│   └── 000005_seed_data.up.sql
├── models/                   # Model data & DTO
│   ├── user.go
│   ├── role.go
│   ├── permission.go
│   └── menu.go
├── repositories/             # Layer akses database
│   ├── user_repository.go
│   ├── role_repository.go
│   ├── permission_repository.go
│   └── menu_repository.go
├── routes/
│   └── routes.go            # Definisi routing
├── services/                 # Layer business logic
│   ├── auth_service.go
│   ├── user_service.go
│   ├── role_service.go
│   ├── permission_service.go
│   └── menu_service.go
├── utils/
│   ├── jwt.go               # Utility JWT token
│   ├── password.go           # Hashing password
│   └── response.go          # Standard API response
├── .air.toml                 # Konfigurasi Air (hot reload)
├── .env.example
├── docker-compose.yml        # PostgreSQL & Redis
├── Dockerfile                # Production build
└── go.mod
```

## Cara Menjalankan

### Prasyarat

- Go 1.22+
- Docker & Docker Compose (via WSL)
- Air (hot reload)

### 1. Jalankan PostgreSQL & Redis via Docker Compose

Buka terminal WSL, lalu:

```bash
cd /mnt/c/data_dave/work/Kantor/Framework/247-golang-api

# Jalankan PostgreSQL dan Redis
docker-compose up -d

# Cek status container
docker-compose ps
```

### 2. Install Air (jika belum)

```bash
go install github.com/air-verse/air@latest
```

### 3. Jalankan Aplikasi

Dari Git Bash atau terminal:

```bash
cd /c/data_dave/work/Kantor/Framework/247-golang-api

# Install dependencies
go mod tidy

# Jalankan dengan hot reload
air
```

Atau tanpa air:

```bash
go run cmd/main.go
```

API akan berjalan di `http://localhost:8080`

### 4. Swagger UI

Setelah aplikasi berjalan, buka Swagger UI di browser:

```
http://localhost:8080/swagger/index.html
```

Swagger menyediakan dokumentasi interaktif untuk semua endpoint, termasuk:
- Contoh request/response body
- Tombol "Try it out" untuk testing langsung
- Autentikasi Bearer token (klik "Authorize" di kanan atas)

#### Regenerate Swagger Docs

Jika ada perubahan di handler annotations, jalankan:

```bash
swag init -g cmd/main.go -o docs
```

### 5. Migrasi SQL Otomatis

Saat aplikasi startup (termasuk saat `air` restart), aplikasi akan **otomatis menjalankan file migrasi SQL** di folder `migrations/`:

1. **GORM AutoMigrate** - membuat/update struktur tabel dari model Go
2. **SQL Migrator** - membaca semua file `*.up.sql`, mengecek tabel `schema_migrations`, lalu menjalankan file yang belum pernah dieksekusi

Untuk menambahkan migrasi baru, cukup buat file SQL baru di folder `migrations/`:

```
migrations/000006_nama_migrasi_baru.up.sql
```

Restart `air` dan file tersebut akan otomatis dijalankan. File yang sudah pernah dijalankan **tidak akan dieksekusi ulang**.

## User Default

| Username     | Password      | Role        | Deskripsi                        |
|-------------|---------------|-------------|----------------------------------|
| `superadmin` | `password123` | superadmin  | Akses penuh, bypass semua RBAC   |
| `admin`      | `password123` | admin       | Semua permission ditugaskan      |
| `manager`    | `password123` | manager     | Manajemen user + laporan         |
| `staff`      | `password123` | staff       | Dashboard + lihat laporan saja   |

> **Penting:** Segera ganti semua password setelah deployment pertama!

## API Endpoints

### Autentikasi (Publik)

| Method | Endpoint               | Deskripsi          |
|--------|------------------------|--------------------|
| POST   | `/api/v1/auth/login`   | Login              |
| POST   | `/api/v1/auth/refresh` | Refresh token      |

### Autentikasi (Terproteksi)

| Method | Endpoint                       | Deskripsi           |
|--------|--------------------------------|---------------------|
| POST   | `/api/v1/auth/logout`          | Logout              |
| GET    | `/api/v1/auth/me`              | Info user saat ini  |
| PUT    | `/api/v1/auth/change-password` | Ganti password      |

### Users (memerlukan permission `user.*`)

| Method | Endpoint              | Permission    |
|--------|-----------------------|---------------|
| GET    | `/api/v1/users`       | `user.view`   |
| GET    | `/api/v1/users/:id`   | `user.view`   |
| POST   | `/api/v1/users`       | `user.create` |
| PUT    | `/api/v1/users/:id`   | `user.update` |
| DELETE | `/api/v1/users/:id`   | `user.delete` |

### Roles (memerlukan permission `role.*`)

| Method | Endpoint              | Permission    |
|--------|-----------------------|---------------|
| GET    | `/api/v1/roles`       | `role.view`   |
| GET    | `/api/v1/roles/:id`   | `role.view`   |
| POST   | `/api/v1/roles`       | `role.create` |
| PUT    | `/api/v1/roles/:id`   | `role.update` |
| DELETE | `/api/v1/roles/:id`   | `role.delete` |

### Permissions (memerlukan permission `permission.*`)

| Method | Endpoint                         | Permission          |
|--------|----------------------------------|---------------------|
| GET    | `/api/v1/permissions`            | `permission.view`   |
| GET    | `/api/v1/permissions?module=user`| `permission.view`   |
| GET    | `/api/v1/permissions/:id`        | `permission.view`   |
| POST   | `/api/v1/permissions`            | `permission.create` |
| PUT    | `/api/v1/permissions/:id`        | `permission.update` |
| DELETE | `/api/v1/permissions/:id`        | `permission.delete` |

### Menus

| Method | Endpoint                | Permission    | Deskripsi                        |
|--------|-------------------------|---------------|----------------------------------|
| GET    | `/api/v1/menus/my`      | *(login)*     | Menu tree sesuai RBAC user       |
| GET    | `/api/v1/menus`         | `menu.view`   | Semua menu (flat)                |
| GET    | `/api/v1/menus/tree`    | `menu.view`   | Full menu tree                   |
| GET    | `/api/v1/menus/:id`     | `menu.view`   | Detail menu                      |
| POST   | `/api/v1/menus`         | `menu.create` | Buat menu                        |
| PUT    | `/api/v1/menus/:id`     | `menu.update` | Update menu                      |
| DELETE | `/api/v1/menus/:id`     | `menu.delete` | Hapus menu                       |

## Contoh Penggunaan

### Login

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}'
```

### Ambil Menu Saya (Dynamic RBAC)

```bash
curl http://localhost:8080/api/v1/menus/my \
  -H "Authorization: Bearer <access_token>"
```

### Buat User Baru

```bash
curl -X POST http://localhost:8080/api/v1/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "username": "userbaru",
    "email": "userbaru@example.com",
    "password": "rahasia123",
    "full_name": "User Baru",
    "role_id": "10000000-0000-0000-0000-000000000004"
  }'
```

### Assign Permission ke Role

```bash
curl -X PUT http://localhost:8080/api/v1/roles/<role_id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "permission_ids": [
      "a0000000-0000-0000-0000-000000000001",
      "e0000000-0000-0000-0000-000000000001"
    ]
  }'
```

## Cara Kerja Dynamic RBAC

1. Setiap **Permission** punya kode unik (contoh: `user.view`, `role.create`)
2. **Role** di-assign kumpulan permission melalui tabel `role_permissions`
3. Setiap **User** memiliki satu **Role**
4. **Menu** terhubung ke **Permission** melalui field `permission_id`
5. `GET /api/v1/menus/my` mengembalikan hanya menu yang role user-nya punya akses
6. Role `superadmin` bypass semua pengecekan permission
7. Permission di-cache di Redis untuk performa optimal

## Migrasi SQL

File migrasi ada di direktori `migrations/` dan dijalankan **otomatis saat startup** aplikasi. Tracking migrasi disimpan di tabel `schema_migrations` di PostgreSQL.

### Cara kerja migrator:

1. Saat startup, aplikasi membaca semua file `*.up.sql` di folder `migrations/`
2. Mengecek tabel `schema_migrations` untuk melihat mana yang sudah pernah dijalankan
3. Menjalankan file baru secara berurutan (berdasarkan nama file)
4. Mencatat file yang berhasil agar tidak dijalankan ulang di startup berikutnya

### Menambah migrasi baru:

```bash
# Buat file migrasi baru dengan format: NNNNNN_deskripsi.up.sql
# Contoh:
touch migrations/000006_add_audit_log_table.up.sql
```

Isi file SQL sesuai kebutuhan, lalu restart `air`. Migrasi akan otomatis dijalankan.

### Rollback manual (opsional):

File `*.down.sql` disediakan untuk rollback manual jika diperlukan:

```bash
# Dari WSL
docker exec -i api247-postgres psql -U postgres -d api247 < migrations/000005_seed_data.down.sql
```

## Environment Variables

| Variable                   | Default                              | Deskripsi                  |
|----------------------------|--------------------------------------|----------------------------|
| `APP_PORT`                 | `8080`                               | Port aplikasi              |
| `APP_ENV`                  | `development`                        | Mode environment           |
| `DB_HOST`                  | `localhost`                          | Host PostgreSQL            |
| `DB_PORT`                  | `5432`                               | Port PostgreSQL            |
| `DB_USER`                  | `postgres`                           | User PostgreSQL            |
| `DB_PASSWORD`              | `secret`                             | Password PostgreSQL        |
| `DB_NAME`                  | `api247`                             | Nama database              |
| `DB_SSLMODE`               | `disable`                            | SSL mode PostgreSQL        |
| `DB_TIMEZONE`              | `Asia/Jakarta`                       | Timezone database          |
| `REDIS_HOST`               | `localhost`                          | Host Redis                 |
| `REDIS_PORT`               | `6379`                               | Port Redis                 |
| `REDIS_PASSWORD`           |                                      | Password Redis             |
| `REDIS_DB`                 | `0`                                  | Nomor database Redis       |
| `JWT_SECRET`               | `your-super-secret-key`              | Secret penandatangan JWT   |
| `JWT_EXPIRY_HOURS`         | `24`                                 | Masa berlaku access token  |
| `JWT_REFRESH_EXPIRY_HOURS` | `168`                                | Masa berlaku refresh (7h)  |

## Hentikan Services

```bash
# Hentikan PostgreSQL & Redis
docker-compose down

# Hentikan dan hapus volume data
docker-compose down -v
```

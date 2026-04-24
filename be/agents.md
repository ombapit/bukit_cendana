# Backend Agent Guide (be/)

Aplikasi manajemen komunitas perumahan **Bukit Cendana**. Backend dibangun dengan Go + Gin + PostgreSQL + Redis menggunakan clean architecture.

## Tech Stack

- **Language:** Go 1.23
- **Framework:** Gin (HTTP), GORM (ORM)
- **Database:** PostgreSQL
- **Cache/Session:** Redis
- **Auth:** JWT (access token + refresh token)
- **Docs:** Swagger/OpenAPI (`/swagger/index.html`)
- **Dev hot-reload:** Air (`.air.toml`)

## Arsitektur

```
Request → Routes → Middleware (JWT/RBAC) → Handler → Service → Repository → DB
```

Clean architecture berlapis 4:

| Layer | Folder | Tanggung Jawab |
|-------|--------|----------------|
| Handler | `handlers/` | Parse request, validasi input, format response |
| Service | `services/` | Business logic, aturan domain |
| Repository | `repositories/` | Query database (GORM) |
| Model | `models/` | Struct data + GORM tags |

## Domain / Entitas

### Warga (Penghuni)
File: `models/warga.go`, `handlers/warga_handler.go`, `services/warga_service.go`, `repositories/warga_repository.go`

Field utama: `nama`, `blok`, `no_telp`, `iuran` (iuran bulanan)

### Transaksi (Pembayaran Iuran)
File: `models/transaksi.go`, `handlers/transaksi_handler.go`, `services/transaksi_service.go`, `repositories/transaksi_repository.go`

Field utama: `warga_id`, `tanggal_ipl` (format YYYYmm, misal `202404`)

### User / Role / Permission (RBAC)
File: `models/user.go`, `models/role.go`, `models/permission.go`
Middleware RBAC: `middleware/rbac.go`

### Menu (Sidebar dinamis)
File: `models/menu.go` — hierarkis, terkait dengan permission

## Struktur File

```
be/
├── cmd/
│   ├── main.go                  # Entry point - inisialisasi DB, service, handler, routes
│   └── reset_transaksi/         # Utility reset data transaksi
├── config/config.go             # Env variables (DB_HOST, JWT_SECRET, dll.)
├── database/
│   ├── database.go              # Koneksi PostgreSQL & Redis
│   └── migrator.go             # Jalankan migrasi SQL
├── handlers/                   # HTTP handler per domain
├── middleware/
│   ├── auth.go                  # Validasi JWT token
│   └── rbac.go                  # Cek permission berdasarkan role
├── models/                      # Struct GORM
├── repositories/               # Data access layer
├── services/                   # Business logic
├── routes/routes.go            # Definisi semua endpoint API
├── utils/
│   ├── jwt.go                   # Generate & validasi JWT
│   ├── password.go             # Bcrypt hashing
│   ├── response.go             # Format JSON response standar
│   └── validation.go           # Validasi input
├── migrations/                 # File SQL migrasi (urut 000001..N)
└── docs/                       # Swagger auto-generated
```

## API Endpoints

Base path: `/api/v1`

| Method | Path | Auth | Permission |
|--------|------|------|------------|
| POST | `/auth/login` | - | - |
| POST | `/auth/refresh` | - | - |
| POST | `/auth/logout` | JWT | - |
| GET | `/auth/me` | JWT | - |
| GET | `/warga` | - | - |
| POST/PUT/DELETE | `/warga` | JWT | `warga.*` |
| CRUD | `/users` | JWT | `user.*` |
| CRUD | `/roles` | JWT | `role.*` |
| CRUD | `/permissions` | JWT | `permission.*` |
| CRUD | `/menus` | JWT | `menu.*` |
| GET/POST/DELETE | `/transaksi` | JWT | `transaksi.*` |

## Cara Menambah Fitur Baru

Ikuti pola yang sudah ada:

1. **Buat model** di `models/<nama>.go` — struct dengan GORM tags
2. **Buat migration** di `migrations/` — nama file: `0000N_<nama>_table.up.sql` dan `.down.sql`
3. **Buat repository** di `repositories/<nama>_repository.go` — interface + implementasi GORM
4. **Buat service** di `services/<nama>_service.go` — business logic, inject repository
5. **Buat handler** di `handlers/<nama>_handler.go` — parse request, panggil service, return response
6. **Daftarkan route** di `routes/routes.go` — dengan middleware JWT/RBAC sesuai kebutuhan
7. **Wire di main.go** — inisialisasi repository → service → handler

## Konvensi Kode

- Nama permission menggunakan format `<modul>.<aksi>`, contoh: `warga.create`, `transaksi.delete`
- Response API menggunakan helper `utils/response.go` — selalu pakai `Success()` / `Error()`
- Semua password di-hash dengan bcrypt via `utils/password.go`
- UUID digunakan sebagai primary key (`github.com/google/uuid`)
- Migrasi berjalan otomatis saat startup via `database/migrator.go`

## Environment Variables

```
DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
REDIS_HOST, REDIS_PORT
JWT_SECRET
PORT (default: 8080)
```

## Menjalankan Backend

```bash
# Development (hot-reload)
air

# Build & run
go build -o app ./cmd/main.go && ./app

# Swagger docs
# buka http://localhost:8080/swagger/index.html
```

## Akun Demo

| Username | Role | Password |
|----------|------|----------|
| superadmin | Super Administrator | password123 |
| admin | Administrator | password123 |
| staff | Staff | password123 |

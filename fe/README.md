# 247 Next.js Frontend

Frontend untuk 247 Golang API menggunakan Next.js dengan landing page dan halaman admin lengkap.

## Teknologi

- **Next.js 16** - React framework dengan App Router
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Utility-first CSS
- **Axios** - HTTP client dengan interceptor + auto refresh token
- **dnd-kit** - Drag & drop untuk reorder menu
- **Lucide React** - Icon library
- **Docker** - Production deployment

## Fitur

### UI/UX
- Glassmorphism design (efek kaca transparan + blur)
- Glow effects dengan tema warna merah (Telkomsel-style)
- Dark mode / Light mode (toggle + persist localStorage)
- Multi-language (English & Indonesia, toggle + persist localStorage)
- Responsif (desktop, tablet, mobile)
- Sidebar collapsible (desktop) + hamburger slide-in (mobile)
- Flyout submenu saat sidebar di-minimize
- Top bar dengan language switcher, theme toggle, dan info user

### Fungsional
- Landing page responsif dengan fitur highlights
- Halaman login dengan akun demo cepat (1 klik isi form)
- Toggle show/hide password
- Dashboard admin dengan statistik
- Dynamic sidebar berdasarkan RBAC user (dari API `/menus/my`)
- Permission guard (akses URL langsung tanpa permission ditolak)
- CRUD Users dengan pagination, search, detail view, toggle aktif/nonaktif
- CRUD Roles dengan assign permission (checkbox per module)
- CRUD Permissions dengan filter module (tab)
- CRUD Menus dengan tree view + drag & drop reorder
- Halaman profil dan ganti password
- Validasi form dengan tanda `*` pada field wajib
- Error validation dari backend diterjemahkan ke bahasa aktif
- Auto refresh token (axios interceptor)
- Redirect otomatis jika belum login

## Struktur Project

```
247-nextjs/
├── src/
│   ├── app/
│   │   ├── page.tsx                        # Landing page
│   │   ├── layout.tsx                      # Root layout + providers
│   │   ├── globals.css                     # Glassmorphism + glow CSS
│   │   ├── login/page.tsx                  # Halaman login
│   │   └── admin/
│   │       ├── layout.tsx                  # Admin layout + sidebar + topbar
│   │       ├── dashboard/page.tsx          # Dashboard statistik
│   │       ├── users/
│   │       │   ├── list/page.tsx           # CRUD Users (tabel + pagination)
│   │       │   └── create/page.tsx         # Form buat user baru
│   │       ├── access/
│   │       │   ├── roles/page.tsx          # CRUD Roles + assign permission
│   │       │   └── permissions/page.tsx    # CRUD Permissions + filter module
│   │       ├── settings/
│   │       │   └── menus/page.tsx          # CRUD Menus (tree + drag & drop)
│   │       ├── reports/
│   │       │   ├── view/page.tsx           # Placeholder laporan
│   │       │   └── export/page.tsx         # Placeholder ekspor
│   │       └── profile/page.tsx            # Profil & ganti password
│   ├── components/
│   │   ├── ui/                             # Komponen UI reusable (glass theme)
│   │   │   ├── button.tsx                  # Gradient button
│   │   │   ├── input.tsx                   # Glass input + required *
│   │   │   ├── select.tsx                  # Glass select + required *
│   │   │   ├── modal.tsx                   # Glass modal + backdrop blur
│   │   │   ├── badge.tsx                   # Ring badge
│   │   │   ├── table.tsx                   # Glass table
│   │   │   ├── theme-toggle.tsx            # Sun/Moon toggle
│   │   │   └── language-switcher.tsx       # Flag language toggle
│   │   └── admin/
│   │       ├── sidebar.tsx                 # Collapsible sidebar + flyout
│   │       ├── topbar.tsx                  # Top bar + hamburger
│   │       └── permission-guard.tsx        # RBAC page guard
│   ├── contexts/
│   │   ├── auth-context.tsx                # Auth + menus + permission check
│   │   ├── theme-context.tsx               # Dark/light mode
│   │   ├── locale-context.tsx              # Multi-language (en/id)
│   │   └── sidebar-context.tsx             # Sidebar open/collapse state
│   ├── lib/
│   │   ├── api.ts                          # Axios + interceptor + auto refresh
│   │   ├── services.ts                     # API service layer (semua endpoint)
│   │   ├── validation.ts                   # Parse API error → i18n message
│   │   ├── cn.ts                           # Tailwind class merge
│   │   └── i18n/
│   │       ├── index.ts                    # Locale types + loader
│   │       ├── en.ts                       # English translations
│   │       └── id.ts                       # Indonesian translations
│   └── types/
│       └── index.ts                        # TypeScript types (semua model)
├── docker-compose.yml                      # Production Docker Compose
├── Dockerfile                              # Multi-stage production build
├── next.config.ts                          # output: standalone
└── .env.example
```

## Cara Menjalankan

### Prasyarat

- Node.js 20+
- 247 Golang API sudah berjalan di `http://localhost:8080`

### Development

```bash
cd 247-nextjs

# Copy environment file
cp .env.example .env.local

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Buka `http://localhost:3000` di browser.

### Production (Docker)

```bash
# Build dan jalankan via Docker Compose
docker-compose up --build -d

# Atau custom API URL
docker-compose build --build-arg NEXT_PUBLIC_API_URL=http://api.example.com/api/v1
docker-compose up -d
```

Frontend akan berjalan di `http://localhost:3000`

## Halaman

| URL                          | Deskripsi                              | Akses            |
|------------------------------|----------------------------------------|------------------|
| `/`                          | Landing page                           | Publik           |
| `/login`                     | Halaman login + akun demo              | Publik           |
| `/admin/dashboard`           | Dashboard dengan statistik             | Login            |
| `/admin/users/list`          | Kelola users (CRUD + pagination)       | `user.view`      |
| `/admin/users/create`        | Form buat user baru                    | `user.create`    |
| `/admin/access/roles`        | Kelola roles & assign permission       | `role.view`      |
| `/admin/access/permissions`  | Kelola permissions (filter module)     | `permission.view`|
| `/admin/settings/menus`      | Kelola menus (tree + drag & drop)      | `menu.view`      |
| `/admin/reports/view`        | Halaman laporan (placeholder)          | `report.view`    |
| `/admin/reports/export`      | Ekspor laporan (placeholder)           | `report.export`  |
| `/admin/profile`             | Profil & ganti password                | Login            |

## Fitur Detail

### Dynamic Sidebar (RBAC)

Sidebar diambil dari endpoint `GET /api/v1/menus/my` yang mengembalikan menu tree sesuai permission user:

- **Superadmin**: semua menu
- **Admin**: semua menu (semua permission)
- **Manager**: Dashboard, User Management, Reports
- **Staff**: Dashboard, Reports (view only)

Sidebar otomatis ter-update sesuai role dan permission yang di-assign.

### Permission Guard

Jika user mengakses URL secara langsung tanpa permission (misal staff akses `/admin/users/create`), halaman menampilkan "Akses Ditolak" dengan pesan multi-language.

### Dark Mode & Light Mode

- Toggle via icon Sun/Moon di top bar (admin) atau navbar (landing/login)
- Tema tersimpan di localStorage, persist antar sesi
- Glassmorphism + glow effect di kedua mode
- Anti-flash script di `<head>` untuk mencegah flicker saat load

### Multi-Language (i18n)

- Toggle via tombol flag di top bar / navbar
- 2 bahasa: English (default) dan Indonesia
- Semua teks UI, label form, error validation, dan pesan diterjemahkan
- Error dari backend API juga diterjemahkan ke bahasa aktif
- Persist di localStorage

### Responsif

- **Desktop (>= 1024px)**: sidebar full/collapsible dengan flyout submenu
- **Tablet/Mobile (< 1024px)**: sidebar tersembunyi, hamburger menu di top bar, sidebar slide-in overlay

### Drag & Drop Menu Reorder

- Halaman `/admin/settings/menus` mendukung drag & drop untuk mengurutkan menu
- Drag handle (icon ⠿) di setiap item
- Reorder root menu dan sub-menu secara independen
- Optimistic update (UI langsung berubah) + auto-save ke backend
- Rollback otomatis jika gagal save

### Validasi Form

- Field wajib ditandai dengan `*` merah pada label
- Error dari backend diparsing dan diterjemahkan ke bahasa aktif
- Contoh: `Name is required` (EN) → `Nama wajib diisi` (ID)

## Environment Variables

| Variable               | Default                            | Deskripsi          |
|------------------------|------------------------------------|--------------------|
| `NEXT_PUBLIC_API_URL`  | `http://localhost:8080/api/v1`     | URL backend API    |

## Menjalankan Bersama Backend

Pastikan backend (247-golang-api) sudah berjalan:

```bash
# Terminal 1 - WSL (PostgreSQL + Redis)
cd 247-golang-api
docker-compose up -d

# Terminal 2 - Git Bash (Backend API)
cd 247-golang-api
air

# Terminal 3 - Git Bash (Frontend)
cd 247-nextjs
npm run dev
```

Akses:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger/index.html`

# Frontend Agent Guide (fe/)

Frontend aplikasi manajemen komunitas perumahan **Bukit Cendana**. Dibangun dengan Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4.

## Tech Stack

- **Framework:** Next.js 16.2 (App Router)
- **UI Library:** React 19 + TypeScript
- **Styling:** Tailwind CSS 4
- **HTTP Client:** Axios (instance di `lib/api.ts`)
- **Icons:** Lucide React
- **Drag & Drop:** `@dnd-kit` (untuk sorting menu)
- **Class utils:** `clsx` + `tailwind-merge` via `lib/cn.ts`

## Struktur Folder

```
fe/src/
├── app/                         # Next.js App Router (file-based routing)
│   ├── page.tsx                 # Landing page publik
│   ├── layout.tsx               # Root layout + semua Provider
│   ├── globals.css              # Global Tailwind styles
│   ├── login/page.tsx           # Form login
│   ├── warga/page.tsx           # Halaman publik daftar penghuni
│   └── admin/                   # Area admin (butuh autentikasi)
│       ├── layout.tsx           # Layout admin: sidebar + topbar
│       ├── dashboard/page.tsx
│       ├── users/
│       │   ├── list/page.tsx    # Daftar user
│       │   └── create/page.tsx  # Tambah user baru
│       ├── roles/page.tsx       # Manajemen role
│       ├── permissions/page.tsx # Manajemen permission
│       ├── menus/page.tsx       # Konfigurasi menu sidebar
│       ├── settings/menus/page.tsx
│       ├── iplsge.tsx  # Transaksi pembayaran
│       ├── reports/
│       │   ├── view/page.tsx
│       │   └── export/page.tsx
│       └── profile/page.tsx
│
├── components/
│   ├── admin/
│   │   ├── sidebar.tsx          # Sidebar navigasi admin
│   │   ├── topbar.tsx           # Topbar (user info, theme, bahasa)
│   │   └── permission-guard.tsx # Wrap komponen dengan cek permission
│   └── ui/                      # Komponen UI dasar
│       ├── button.tsx
│       ├── input.tsx
│       ├── modal.tsx
│       ├── table.tsx
│       ├── select.tsx
│       ├── badge.tsx
│       ├── theme-toggle.tsx     # Dark/light mode toggle
│       └── language-switcher.tsx # Ganti bahasa EN/ID
│
├── contexts/                    # React Context (state global)
│   ├── auth-context.tsx         # Auth state: user, token, login(), logout()
│   ├── theme-context.tsx        # Dark mode state
│   ├── locale-context.tsx       # Bahasa aktif (id/en)
│   └── sidebar-context.tsx      # Sidebar collapsed/expanded
│
├── lib/
│   ├── api.ts                   # Axios instance + interceptor (auto-attach token)
│   ├── services.ts              # Semua fungsi pemanggilan API
│   ├── cn.ts                    # Helper merge Tailwind class
│   ├── validation.ts            # Helper validasi form
│   └── i18n/
│       ├── en.ts                # Teks bahasa Inggris
│       ├── id.ts                # Teks bahasa Indonesia
│       └── index.ts             # Hook `useTranslation()`
│
└── types/
    └── index.ts                 # Semua TypeScript interface
```

## State Management

Menggunakan React Context (tidak ada Redux/Zustand):

| Context | File | Isi |
|---------|------|-----|
| Auth | `contexts/auth-context.tsx` | user, token, isAuthenticated, login(), logout() |
| Theme | `contexts/theme-context.tsx` | theme (dark/light), toggleTheme() |
| Locale | `contexts/locale-context.tsx` | locale (id/en), setLocale() |
| Sidebar | `contexts/sidebar-context.tsx` | collapsed, toggle() |

Semua context di-provide di `app/layout.tsx`.

## Memanggil API

Gunakan fungsi dari `lib/services.ts`. Jangan buat panggilan Axios langsung di halaman.

```typescript
// Contoh di halaman:
import { wargaService, transaksiService } from '@/lib/services'

// Get semua warga
const data = await wargaService.getAll()

// Tambah transaksi
await transaksiService.create({ warga_id: '...', tanggal_ipl: '202404' })
```

Axios instance di `lib/api.ts` sudah handle:
- Base URL dari environment
- Auto-attach `Authorization: Bearer <token>` dari localStorage
- Auto-redirect ke `/login` jika 401

## Internasionalisasi (i18n)

```typescript
import { useTranslation } from '@/lib/i18n'

const { t } = useTranslation()
// t('nav.dashboard') → "Dashboard" (EN) / "Dasbor" (ID)
```

Tambah teks baru di `lib/i18n/en.ts` dan `lib/i18n/id.ts` secara bersamaan.

## RBAC di Frontend

Gunakan `PermissionGuard` untuk menyembunyikan elemen berdasarkan permission:

```tsx
import PermissionGuard from '@/components/admin/permission-guard'

<PermissionGuard permission="warga.create">
  <Button>Tambah Warga</Button>
</PermissionGuard>
```

Permission user diambil dari auth context setelah login.

## TypeScript Types

Semua interface ada di `types/index.ts`:

- `LoginRequest` / `LoginResponse`
- `UserResponse`, `Role`, `Permission`
- `Menu`
- `WargaWithLastPayment`
- `Transaksi`
- `ApiResponse<T>` — wrapper response dari backend

## Cara Menambah Halaman Admin Baru

1. Buat folder di `app/admin/<nama>/` dengan `page.tsx`
2. Halaman otomatis pakai layout admin (sidebar + topbar) dari `app/admin/layout.tsx`
3. Tambahkan fungsi service di `lib/services.ts`
4. Tambahkan types di `types/index.ts` jika perlu
5. Tambahkan teks di `lib/i18n/en.ts` dan `lib/i18n/id.ts`
6. Wrap aksi sensitif dengan `<PermissionGuard permission="<modul>.<aksi>">`

## Konvensi Kode

- Komponen menggunakan **PascalCase** (`UserTable`, `PermissionGuard`)
- Fungsi service dikelompokkan per domain: `wargaService`, `transaksiService`, `userService`, dll.
- Gunakan `cn()` dari `lib/cn.ts` untuk menggabungkan class Tailwind secara kondisional
- Komponen UI dasar ada di `components/ui/` — pakai ulang, jangan buat duplikat
- Dark mode: gunakan class Tailwind `dark:` — sudah di-handle oleh `ThemeContext`

## Environment Variables

```
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

## Menjalankan Frontend

```bash
# Development
npm run dev

# Build production
npm run build && npm start

# Type check
npm run type-check
```

Buka di: `http://localhost:3000`

## Halaman Publik vs Admin

| Path | Akses | Keterangan |
|------|-------|------------|
| `/` | Publik | Landing page |
| `/warga` | Publik | Daftar penghuni |
| `/login` | Publik | Form login |
| `/admin/*` | Autentikasi | Redirect ke `/login` jika belum login |

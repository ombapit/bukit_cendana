# Flutter Mobile App - Dashboard Architecture

## Overview
Updated the Flutter mobile app to have the **Dashboard** (news feed based on Pengumuman module) as the main screen on app launch, with **Login** moved to a menu option.

## Changes Made

### 1. Main Entry Point (lib/main.dart)
- Cleaned up boilerplate code (removed MyHomePage test class)
- App title changed to "Bukit Cendana"
- Enabled Material 3 design
- Routes through AppRouter

### 2. Dashboard Screen (lib/home_screen.dart) → DashboardScreen
- **Main landing page** with news feed grid layout
- Search functionality for announcements
- Category filter dropdown (Umum, Keamanan, Kebersihan, Kegiatan, Penting, Keuangan)
- Sidebar menu with options:
  - Home (current page)
  - Laporan
  - Warga
  - Admin
  - Login
- Grid cards showing announcement previews with:
  - Image/placeholder
  - Category badge
  - Title
  - Description preview
  - Date posted
  - Author name

### 3. Login Screen (lib/login_screen.dart)
- Username and password input fields
- Redesigned as a menu item (no longer the default screen)
- Login button navigates back to dashboard on success
- Removed from AppBar navigation; accessible only via drawer menu

### 4. App Router (lib/app_router.dart)
- Updated `initialRoute` to `'/'` (Dashboard)
- AppRouter.generateRoute now defaults to DashboardScreen instead of HomeScreen
- Login accessible via `/login` route

### 5. Other Screens
- AdminScreen, LaporanScreen, PengumumanScreen, WargaScreen remain as placeholders
- Can be accessed via the drawer menu

## Architecture Pattern

**Data Flow** (from fe next.js):
```
API (pengummuan service) 
  → API Client (Dio) 
  → DashboardScreen (displays cards) 
  → Detail view on tap
```

**To Implement Next:**
1. Wire up API client to fetch announcements from backend `/pengumuman` endpoint
2. Replace mock grid cards with real data
3. Implement category filtering
4. Add search functionality
5. Implement detail screen modal/page
6. Add real login auth flow

## File Structure
```
mobile/lib/
├── main.dart              (App entry + MyApp)
├── app_router.dart        (Route config)
├── home_screen.dart       (Dashboard - news feed)
├── login_screen.dart      (Login form)
├── admin_screen.dart      (Placeholder)
├── laporan_screen.dart    (Placeholder)
├── pengumuman_screen.dart (Placeholder)
└── warga_screen.dart      (Placeholder)
```

## Dependencies Added
- `dio: ^5.2.1` (HTTP client for API calls)

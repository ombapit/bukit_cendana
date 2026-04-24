const id = {
  // Common
  common: {
    save: "Simpan",
    cancel: "Batal",
    delete: "Hapus",
    edit: "Edit",
    create: "Buat",
    close: "Tutup",
    back: "Kembali",
    search: "Cari",
    loading: "Memuat...",
    noData: "Tidak ada data",
    active: "Aktif",
    inactive: "Nonaktif",
    status: "Status",
    actions: "Aksi",
    confirm: "Konfirmasi",
    yes: "Ya",
    no: "Tidak",
    all: "Semua",
    showing: "Menampilkan",
    of: "dari",
    page: "Halaman",
    name: "Nama",
    description: "Deskripsi",
    darkMode: "Mode gelap",
    lightMode: "Mode terang",
    language: "Bahasa",
  },

  // Landing Page
  landing: {
    heroTitle1: "Punya Warga",
    heroTitle2: "Cendana",
    heroDesc: "Website untuk mengelola data warga, IPL, menyampaikan pengumuman, dan mempermudah komunikasi antar warga. Dirancang ringan, mudah digunakan, dan sesuai untuk kebutuhan administrasi lingkungan RT sehari-hari.",
    getStarted: "Mulai Sekarang",
    viewFeatures: "Lihat Fitur",
    mainFeatures: "Fitur Utama",
    mainFeaturesDesc: "Semua yang dibutuhkan untuk warga",
    readyToStart: "Siap untuk memulai?",
    readyToStartDesc: "Login dengan akun default untuk mencoba semua fitur.",
    defaultAccount: "Akun default:",
    username: "Username",
    password: "Password",
    loginNow: "Login Sekarang",
    loginBtn: "Login",
    enterDashboard: "Masuk Dashboard",
    features: {
      warga: { title: "Data Warga", desc: "Kelola data warga Bukit Cendana termasuk nama, blok rumah, nomor telepon, dan jumlah iuran IPL per bulan." },
      pengumuman: { title: "Pengumuman", desc: "Buat dan bagikan pengumuman penting kepada seluruh warga dengan mudah melalui dashboard admin." },
      laporan: { title: "Laporan", desc: "Lihat laporan keuangan dan statistik lainnya untuk membantu pengelolaan lingkungan RT." },
    },
    footer: "Dari Oleh dan Untuk Warga Cendana © Ombapit / 2026",
  },

  // Auth / Login
  auth: {
    loginTitle: "Masuk ke dashboard admin",
    usernamePlaceholder: "Masukkan username",
    passwordPlaceholder: "Masukkan password",
    loginButton: "Masuk",
    loginFailed: "Login gagal, periksa username dan password",
    demoAccounts: "Akun demo:",
    superAdmin: "Super Admin",
    admin: "Admin",
    staff: "Staff",
    logout: "Keluar",
    changePassword: "Ganti Password",
    oldPassword: "Password Lama",
    newPassword: "Password Baru",
    confirmNewPassword: "Konfirmasi Password Baru",
    passwordMismatch: "Password baru dan konfirmasi tidak cocok",
    passwordMinLength: "Password baru minimal 6 karakter",
    passwordChanged: "Password berhasil diubah",
    passwordChangeFailed: "Gagal mengubah password",
  },

  // Sidebar
  sidebar: {
    admin: "247 Admin",
  },

  // Dashboard
  dashboard: {
    title: "Dashboard",
    welcome: "Selamat datang kembali,",
    totalUsers: "Total Users",
    totalRoles: "Total Roles",
    totalPermissions: "Total Permissions",
    totalMenus: "Total Menus",
    systemInfo: "Informasi Sistem",
    yourRole: "Role Anda",
    backend: "Backend",
    frontend: "Frontend",
  },

  // Users
  users: {
    title: "Users",
    subtitle: "Kelola daftar pengguna",
    addUser: "Tambah User",
    editUser: "Edit User",
    createUser: "Buat User",
    userDetail: "Detail User",
    deleteUser: "Hapus User",
    searchPlaceholder: "Cari nama, username, atau email...",
    fullName: "Nama Lengkap",
    username: "Username",
    email: "Email",
    password: "Password",
    role: "Role",
    selectRole: "Pilih role",
    clickToDeactivate: "Klik untuk nonaktifkan",
    clickToActivate: "Klik untuk aktifkan",
    allFieldsRequired: "Semua field wajib diisi",
    saveChanges: "Simpan Perubahan",
    deleteConfirm: "Apakah Anda yakin ingin menghapus user",
    deleteWarning: "Tindakan ini tidak dapat dibatalkan.",
    backToList: "Kembali ke daftar user",
    createSubtitle: "Isi form berikut untuk membuat user baru",
    minChars: "min. 3 karakter",
    minPassword: "Minimal 6 karakter",
    total: "total",
    viewDetail: "Lihat detail",
    editUserBtn: "Edit user",
    deleteUserBtn: "Hapus user",
  },

  // Roles
  roles: {
    title: "Roles",
    subtitle: "Kelola role dan permission",
    addRole: "Tambah Role",
    editRole: "Edit Role",
    createRole: "Buat Role",
    roleName: "Nama Role",
    permissions: "Permissions",
    saveChanges: "Simpan Perubahan",
  },

  // Permissions
  permissions: {
    title: "Permissions",
    subtitle: "Kelola daftar permission",
    addPermission: "Tambah Permission",
    editPermission: "Edit Permission",
    createPermission: "Buat Permission",
    code: "Kode",
    module: "Module",
    saveChanges: "Simpan Perubahan",
  },

  // Menus
  menus: {
    title: "Menus",
    subtitle: "Kelola menu navigasi",
    addMenu: "Tambah Menu",
    editMenu: "Edit Menu",
    createMenu: "Buat Menu",
    path: "Path",
    icon: "Icon",
    parentMenu: "Parent Menu",
    rootMenu: "(Root menu)",
    sortOrder: "Urutan",
    permission: "Permission",
    noPermission: "(Tanpa permission)",
    noMenus: "Tidak ada menu",
    saveChanges: "Simpan Perubahan",
  },

  // Profile
  profile: {
    title: "Profil",
    subtitle: "Informasi akun dan ganti password",
    accountInfo: "Informasi Akun",
  },

  // Reports
  reports: {
    viewTitle: "Laporan",
    viewSubtitle: "Lihat laporan sistem",
    viewPlaceholder: "Fitur laporan akan ditambahkan di sini. Anda bisa menampilkan grafik, tabel ringkasan, dan data statistik lainnya.",
    viewHeading: "Halaman Laporan",
    exportTitle: "Ekspor Laporan",
    exportSubtitle: "Ekspor data laporan ke file",
    exportPlaceholder: "Fitur ekspor laporan akan ditambahkan di sini. Anda bisa mengekspor data ke format CSV, Excel, atau PDF.",
    exportHeading: "Ekspor Laporan",
  },

  // Permission Guard
  guard: {
    accessDenied: "Akses Ditolak",
    noPermission: "Anda tidak memiliki permission untuk mengakses halaman ini. Hubungi administrator untuk mendapatkan akses.",
    backToDashboard: "Kembali ke Dashboard",
  },

  // Validation
  validation: {
    required: (field: string) => `${field} wajib diisi`,
    email: (field: string) => `${field} harus berupa email yang valid`,
    min: (field: string, min: string) => `${field} minimal ${min} karakter`,
    max: (field: string, max: string) => `${field} maksimal ${max} karakter`,
    invalid: (field: string) => `${field} tidak valid`,
    fieldNames: {
      name: "Nama",
      username: "Username",
      email: "Email",
      password: "Password",
      full_name: "Nama lengkap",
      role_id: "Role",
      code: "Kode",
      module: "Module",
      description: "Deskripsi",
      path: "Path",
      icon: "Icon",
      sort_order: "Urutan",
      permission_id: "Permission",
      old_password: "Password lama",
      new_password: "Password baru",
    } as Record<string, string>,
  },

  // Misc
  saveFailed: "Gagal menyimpan",
};

export default id;

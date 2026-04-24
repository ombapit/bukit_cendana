const en = {
  // Common
  common: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    close: "Close",
    back: "Back",
    search: "Search",
    loading: "Loading...",
    noData: "No data",
    active: "Active",
    inactive: "Inactive",
    status: "Status",
    actions: "Actions",
    confirm: "Confirm",
    yes: "Yes",
    no: "No",
    all: "All",
    showing: "Showing",
    of: "of",
    page: "Page",
    name: "Name",
    description: "Description",
    darkMode: "Dark mode",
    lightMode: "Light mode",
    language: "Language",
  },

  // Landing Page
  landing: {
    heroTitle1: "Owned by Citizens",
    heroTitle2: "Cendana",
    heroDesc: "A complete management platform with authentication, Dynamic RBAC, and hierarchical menu system. Built with Go and Next.js for optimal performance.",
    getStarted: "Get Started",
    viewFeatures: "View Features",
    mainFeatures: "Main Features",
    mainFeaturesDesc: "Everything you need for enterprise management",
    readyToStart: "Ready to get started?",
    readyToStartDesc: "Login with default account to try all features.",
    defaultAccount: "Default account:",
    username: "Username",
    password: "Password",
    loginNow: "Login Now",
    loginBtn: "Login",
    enterDashboard: "Enter Dashboard",
    features: {
      warga: { title: "Resident Data", desc: "Manage Bukit Cendana resident data including names, house blocks, phone numbers, and monthly IPL contributions." },
      pengumuman: { title: "Announcements", desc: "Create and share important announcements to all residents easily through the admin dashboard." },
      laporan: { title: "Reports", desc: "View financial reports and other statistics to help manage the RT neighborhood." },
    },
    footer: "Built with Next.js & Go.",
  },

  // Auth / Login
  auth: {
    loginTitle: "Login to admin dashboard",
    usernamePlaceholder: "Enter username",
    passwordPlaceholder: "Enter password",
    loginButton: "Login",
    loginFailed: "Login failed, check username and password",
    demoAccounts: "Demo accounts:",
    superAdmin: "Super Admin",
    admin: "Admin",
    staff: "Staff",
    logout: "Logout",
    changePassword: "Change Password",
    oldPassword: "Old Password",
    newPassword: "New Password",
    confirmNewPassword: "Confirm New Password",
    passwordMismatch: "New password and confirmation do not match",
    passwordMinLength: "New password must be at least 6 characters",
    passwordChanged: "Password changed successfully",
    passwordChangeFailed: "Failed to change password",
  },

  // Sidebar
  sidebar: {
    admin: "247 Admin",
  },

  // Dashboard
  dashboard: {
    title: "Dashboard",
    welcome: "Welcome back,",
    totalUsers: "Total Users",
    totalRoles: "Total Roles",
    totalPermissions: "Total Permissions",
    totalMenus: "Total Menus",
    systemInfo: "System Information",
    yourRole: "Your Role",
    backend: "Backend",
    frontend: "Frontend",
  },

  // Users
  users: {
    title: "Users",
    subtitle: "Manage user list",
    addUser: "Add User",
    editUser: "Edit User",
    createUser: "Create User",
    userDetail: "User Detail",
    deleteUser: "Delete User",
    searchPlaceholder: "Search name, username, or email...",
    fullName: "Full Name",
    username: "Username",
    email: "Email",
    password: "Password",
    role: "Role",
    selectRole: "Select role",
    clickToDeactivate: "Click to deactivate",
    clickToActivate: "Click to activate",
    allFieldsRequired: "All fields are required",
    saveChanges: "Save Changes",
    deleteConfirm: "Are you sure you want to delete user",
    deleteWarning: "This action cannot be undone.",
    backToList: "Back to user list",
    createSubtitle: "Fill in the form below to create a new user",
    minChars: "min. 3 characters",
    minPassword: "Minimum 6 characters",
    total: "total",
    viewDetail: "View detail",
    editUserBtn: "Edit user",
    deleteUserBtn: "Delete user",
  },

  // Roles
  roles: {
    title: "Roles",
    subtitle: "Manage roles and permissions",
    addRole: "Add Role",
    editRole: "Edit Role",
    createRole: "Create Role",
    roleName: "Role Name",
    permissions: "Permissions",
    saveChanges: "Save Changes",
  },

  // Permissions
  permissions: {
    title: "Permissions",
    subtitle: "Manage permission list",
    addPermission: "Add Permission",
    editPermission: "Edit Permission",
    createPermission: "Create Permission",
    code: "Code",
    module: "Module",
    saveChanges: "Save Changes",
  },

  // Menus
  menus: {
    title: "Menus",
    subtitle: "Manage navigation menu",
    addMenu: "Add Menu",
    editMenu: "Edit Menu",
    createMenu: "Create Menu",
    path: "Path",
    icon: "Icon",
    parentMenu: "Parent Menu",
    rootMenu: "(Root menu)",
    sortOrder: "Sort Order",
    permission: "Permission",
    noPermission: "(No permission)",
    noMenus: "No menus",
    saveChanges: "Save Changes",
  },

  // Profile
  profile: {
    title: "Profile",
    subtitle: "Account information and change password",
    accountInfo: "Account Information",
  },

  // Reports
  reports: {
    viewTitle: "Reports",
    viewSubtitle: "View system reports",
    viewPlaceholder: "Report features will be added here. You can display charts, summary tables, and other statistical data.",
    viewHeading: "Reports Page",
    exportTitle: "Export Reports",
    exportSubtitle: "Export report data to file",
    exportPlaceholder: "Export features will be added here. You can export data to CSV, Excel, or PDF format.",
    exportHeading: "Export Reports",
  },

  // Permission Guard
  guard: {
    accessDenied: "Access Denied",
    noPermission: "You do not have permission to access this page. Contact the administrator to get access.",
    backToDashboard: "Back to Dashboard",
  },

  // Validation
  validation: {
    required: (field: string) => `${field} is required`,
    email: (field: string) => `${field} must be a valid email`,
    min: (field: string, min: string) => `${field} must be at least ${min} characters`,
    max: (field: string, max: string) => `${field} must be at most ${max} characters`,
    invalid: (field: string) => `${field} is invalid`,
    fieldNames: {
      name: "Name",
      username: "Username",
      email: "Email",
      password: "Password",
      full_name: "Full name",
      role_id: "Role",
      code: "Code",
      module: "Module",
      description: "Description",
      path: "Path",
      icon: "Icon",
      sort_order: "Sort order",
      permission_id: "Permission",
      old_password: "Old password",
      new_password: "New password",
    } as Record<string, string>,
  },

  // Misc
  saveFailed: "Failed to save",
};

export default en;

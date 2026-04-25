import api from "./api";
import type {
  APIResponse,
  Finance,
  FinanceSummary,
  Pengumuman,
  LoginRequest,
  LoginResponse,
  CreateUserRequest,
  UpdateUserRequest,
  UserResponse,
  ChangePasswordRequest,
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  Permission,
  CreatePermissionRequest,
  UpdatePermissionRequest,
  Menu,
  CreateMenuRequest,
  UpdateMenuRequest,
  WargaWithLastPayment,
  WargaResponse,
  CreateWargaRequest,
  UpdateWargaRequest,
  IPL,
} from "@/types";

// ============ Auth ============
export const authService = {
  login: (data: LoginRequest) =>
    api.post<APIResponse<LoginResponse>>("/auth/login", data),

  refresh: (refresh_token: string) =>
    api.post<APIResponse<LoginResponse>>("/auth/refresh", { refresh_token }),

  logout: () => api.post<APIResponse>("/auth/logout"),

  me: () => api.get<APIResponse<{ user_id: string; username: string; role_name: string }>>("/auth/me"),

  changePassword: (data: ChangePasswordRequest) =>
    api.put<APIResponse>("/auth/change-password", data),
};

// ============ Users ============
export const userService = {
  getAll: (page = 1, limit = 10) =>
    api.get<APIResponse<UserResponse[]>>(`/users?page=${page}&limit=${limit}`),

  getById: (id: string) =>
    api.get<APIResponse<UserResponse>>(`/users/${id}`),

  create: (data: CreateUserRequest) =>
    api.post<APIResponse<UserResponse>>("/users", data),

  update: (id: string, data: UpdateUserRequest) =>
    api.put<APIResponse<UserResponse>>(`/users/${id}`, data),

  delete: (id: string) =>
    api.delete<APIResponse>(`/users/${id}`),

  resetPassword: (id: string, newPassword: string) =>
    api.put<APIResponse>(`/users/${id}/password`, { new_password: newPassword }),
};

// ============ Roles ============
export const roleService = {
  getAll: () =>
    api.get<APIResponse<Role[]>>("/roles"),

  getById: (id: string) =>
    api.get<APIResponse<Role>>(`/roles/${id}`),

  create: (data: CreateRoleRequest) =>
    api.post<APIResponse<Role>>("/roles", data),

  update: (id: string, data: UpdateRoleRequest) =>
    api.put<APIResponse<Role>>(`/roles/${id}`, data),

  delete: (id: string) =>
    api.delete<APIResponse>(`/roles/${id}`),
};

// ============ Permissions ============
export const permissionService = {
  getAll: (module?: string) =>
    api.get<APIResponse<Permission[]>>(`/permissions${module ? `?module=${module}` : ""}`),

  getById: (id: string) =>
    api.get<APIResponse<Permission>>(`/permissions/${id}`),

  create: (data: CreatePermissionRequest) =>
    api.post<APIResponse<Permission>>("/permissions", data),

  update: (id: string, data: UpdatePermissionRequest) =>
    api.put<APIResponse<Permission>>(`/permissions/${id}`, data),

  delete: (id: string) =>
    api.delete<APIResponse>(`/permissions/${id}`),
};

// ============ Menus ============
export const menuService = {
  getAll: () =>
    api.get<APIResponse<Menu[]>>("/menus"),

  getTree: () =>
    api.get<APIResponse<Menu[]>>("/menus/tree"),

  getMyMenus: () =>
    api.get<APIResponse<Menu[]>>("/menus/my"),

  getById: (id: string) =>
    api.get<APIResponse<Menu>>(`/menus/${id}`),

  create: (data: CreateMenuRequest) =>
    api.post<APIResponse<Menu>>("/menus", data),

  update: (id: string, data: UpdateMenuRequest) =>
    api.put<APIResponse<Menu>>(`/menus/${id}`, data),

  delete: (id: string) =>
    api.delete<APIResponse>(`/menus/${id}`),
};

// ============ Warga ============
export const wargaService = {
  getAll: (page = 1, limit = 1000, tunggakan?: number) => {
    let url = `/warga?page=${page}&limit=${limit}`;
    if (tunggakan) url += `&tunggakan=${tunggakan}`;
    return api.get<APIResponse<WargaWithLastPayment[]>>(url);
  },

  getById: (id: string) =>
    api.get<APIResponse<WargaResponse>>(`/warga/${id}`),

  create: (data: CreateWargaRequest) =>
    api.post<APIResponse<WargaResponse>>("/warga", data),

  update: (id: string, data: UpdateWargaRequest) =>
    api.put<APIResponse<WargaResponse>>(`/warga/${id}`, data),

  delete: (id: string) =>
    api.delete<APIResponse>(`/warga/${id}`),
};

// ============ Finance ============
export const financeService = {
  getAll: (page = 1, limit = 20, search = "", dateFrom = "", dateTo = "") => {
    let url = `/finance?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (dateFrom) url += `&date_from=${dateFrom}`;
    if (dateTo) url += `&date_to=${dateTo}`;
    return api.get<APIResponse<Finance[]>>(url);
  },

  getSummary: (dateFrom = "", dateTo = "") => {
    let url = "/finance/summary";
    if (dateFrom || dateTo) {
      const params = new URLSearchParams();
      if (dateFrom) params.set("date_from", dateFrom);
      if (dateTo) params.set("date_to", dateTo);
      url += `?${params.toString()}`;
    }
    return api.get<APIResponse<FinanceSummary>>(url);
  },

  create: (data: FormData) =>
    api.post<APIResponse<Finance>>("/finance", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  update: (id: string, data: FormData) =>
    api.put<APIResponse<Finance>>(`/finance/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  delete: (id: string) =>
    api.delete<APIResponse>(`/finance/${id}`),
};

// ============ Pengumuman ============
export const pengumumanService = {
  getAll: (page = 1, limit = 12, search = "", kategori = "", publishedOnly = false) => {
    let url = `/pengumuman?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (kategori) url += `&kategori=${encodeURIComponent(kategori)}`;
    if (publishedOnly) url += `&published_only=true`;
    return api.get<APIResponse<Pengumuman[]>>(url);
  },

  getById: (id: string) =>
    api.get<APIResponse<Pengumuman>>(`/pengumuman/${id}`),

  create: (data: FormData) =>
    api.post<APIResponse<Pengumuman>>("/pengumuman", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  update: (id: string, data: FormData) =>
    api.put<APIResponse<Pengumuman>>(`/pengumuman/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  delete: (id: string) =>
    api.delete<APIResponse>(`/pengumuman/${id}`),
};

// ============ IPL ============
export const iplService = {
  getAll: (page = 1, limit = 20, search = "") => {
    let url = `/ipls?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return api.get<APIResponse<IPL[]>>(url);
  },

  create: (data: FormData) =>
    api.post<APIResponse<IPL>>("/ipls", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  update: (id: string, data: FormData) =>
    api.put<APIResponse<IPL>>(`/ipls/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  delete: (id: string) =>
    api.delete<APIResponse>(`/ipls/${id}`),
};

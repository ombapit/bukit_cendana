import api from "./api";
import type {
  APIResponse,
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
  Transaksi,
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
    return api.get<APIResponse<{ data: WargaWithLastPayment[]; meta: { page: number; limit: number; total: number; total_pages: number } }>>(url);
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

// ============ Transaksi ============
export const transaksiService = {
  getAll: (page = 1, limit = 100) =>
    api.get<APIResponse<{ data: Transaksi[]; meta: { page: number; limit: number; total: number; total_pages: number } }>>(`/transaksi?page=${page}&limit=${limit}`),
};

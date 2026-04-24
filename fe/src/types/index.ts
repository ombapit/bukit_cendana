export interface APIResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: Meta;
}

export interface Meta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: UserResponse;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  is_active: boolean;
  role_id: string;
  role?: Role;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  full_name: string;
  is_active: boolean;
  role?: Role;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  full_name: string;
  role_id: string;
}

export interface UpdateUserRequest {
  email?: string;
  full_name?: string;
  is_active?: boolean;
  role_id?: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  permissions?: Permission[];
  created_at: string;
  updated_at: string;
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  permission_ids?: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  is_active?: boolean;
  permission_ids?: string[];
}

export interface Permission {
  id: string;
  name: string;
  code: string;
  module: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePermissionRequest {
  name: string;
  code: string;
  module: string;
  description: string;
}

export interface UpdatePermissionRequest {
  name?: string;
  code?: string;
  module?: string;
  description?: string;
}

export interface Menu {
  id: string;
  name: string;
  path: string;
  icon: string;
  parent_id?: string;
  children?: Menu[];
  sort_order: number;
  is_active: boolean;
  permission_id?: string;
  permission?: Permission;
  created_at: string;
  updated_at: string;
}

export interface CreateMenuRequest {
  name: string;
  path?: string;
  icon?: string;
  parent_id?: string;
  sort_order?: number;
  permission_id?: string;
}

export interface UpdateMenuRequest {
  name?: string;
  path?: string;
  icon?: string;
  parent_id?: string;
  sort_order?: number;
  is_active?: boolean;
  permission_id?: string;
}

export interface Warga {
  id: string;
  nama: string;
  blok: string;
  no_telp?: string;
  iuran: number;
  created_at: string;
  updated_at: string;
}

export interface WargaResponse {
  id: string;
  nama: string;
  blok: string;
  no_telp?: string;
  iuran: number;
}

export interface CreateWargaRequest {
  nama: string;
  blok: string;
  no_telp?: string;
  iuran: number;
}

export interface UpdateWargaRequest {
  nama?: string;
  blok?: string;
  no_telp?: string;
  iuran?: number;
}

export interface WargaWithLastPayment {
  id: string;
  nama: string;
  blok: string;
  no_telp?: string;
  iuran: number;
  last_payment: string;
}

export interface Transaksi {
  id: string;
  warga_id: string;
  warga_nama: string;
  warga_blok: string;
  tanggal_ipl: string;
  created_at: string;
}

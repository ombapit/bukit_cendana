import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

// Daftar endpoint publik yang TIDAK membutuhkan token Authorization
// Hanya method GET pada endpoint ini yang publik
const PUBLIC_GET_ENDPOINTS = [
  "/warga",
  "/finance",
  "/pengumuman",
  "/anggota-keluarga",
  "/penerima-qurban",
  "/ipl-payments",
  "/activity-logs",
  "/auth/login",
  "/auth/refresh",
];

function isPublicEndpoint(url: string | undefined, method: string | undefined): boolean {
  if (!url) return false;

  // Auth endpoints selalu tidak butuh token
  if (url.includes("/auth/login") || url.includes("/auth/refresh")) {
    return true;
  }

  // Hanya method GET pada endpoint publik
  if (method?.toUpperCase() === "GET") {
    return PUBLIC_GET_ENDPOINTS.some(endpoint => url.includes(endpoint));
  }

  return false;
}

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    // JANGAN kirim token ke endpoint publik
    if (!isPublicEndpoint(config.url, config.method)) {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Jika ini endpoint publik dan terjadi 401, JANGAN redirect ke login
    // Biarkan caller menangani errornya sendiri
    if (isPublicEndpoint(original.url, original.method)) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            { refresh_token: refreshToken }
          );
          const { access_token, refresh_token } = res.data.data;
          localStorage.setItem("access_token", access_token);
          localStorage.setItem("refresh_token", refresh_token);
          original.headers.Authorization = `Bearer ${access_token}`;
          return api(original);
        } catch {
          localStorage.clear();
          window.location.href = "/login";
        }
      } else {
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;

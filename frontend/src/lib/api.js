import axios from "axios";

const normalizeApiBase = (raw) => {
  if (!raw?.trim()) return null;
  let url = raw.trim().replace(/\/$/, "");
  if (url === "https://jobboard-sd2e.onrender.com" || url === "http://jobboard-sd2e.onrender.com") {
    url = `${url}/api`;
  } else if (/^https?:\/\//i.test(url) && !url.endsWith("/api")) {
    url = `${url}/api`;
  }
  return url;
};

/** Production default `/api` is proxied to Render via vercel.json (no CORS). */
const baseURL =
  normalizeApiBase(import.meta.env.VITE_API_URL) ||
  (import.meta.env.PROD ? "/api" : "http://localhost:5000/api");

export const apiBaseURL = baseURL;

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 90000
});
const plainApi = axios.create({ baseURL, withCredentials: true, timeout: 90000 });

let isRefreshing = false;
let refreshWaiters = [];

const flushRefreshWaiters = (nextToken) => {
  refreshWaiters.forEach((resolve) => resolve(nextToken));
  refreshWaiters = [];
};

const ensureCsrf = async () => {
  let token = localStorage.getItem("csrfToken");
  if (!token) {
    const { data } = await plainApi.get("/auth/csrf-token");
    token = data?.csrfToken || "";
    if (token) localStorage.setItem("csrfToken", token);
  }
  return token;
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  const method = (config.method || "get").toLowerCase();
  const needsCsrf = ["post", "put", "patch", "delete"].includes(method) && config.url?.includes("/auth/");
  if (needsCsrf) {
    return ensureCsrf().then((csrfToken) => {
      if (csrfToken) config.headers["x-csrf-token"] = csrfToken;
      return config;
    });
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isUnauthorized = error.response?.status === 401;
    const isCsrfFailure = error.response?.status === 403 && originalRequest?.url?.includes("/auth/");
    const isRefreshCall = originalRequest?.url?.includes("/auth/refresh");

    if (isCsrfFailure && originalRequest && !originalRequest._csrfRetry) {
      originalRequest._csrfRetry = true;
      localStorage.removeItem("csrfToken");
      const nextCsrf = await ensureCsrf();
      if (nextCsrf) originalRequest.headers["x-csrf-token"] = nextCsrf;
      return api(originalRequest);
    }

    if (!isUnauthorized || !originalRequest || originalRequest._retry || isRefreshCall) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      const token = await new Promise((resolve) => refreshWaiters.push(resolve));
      if (token) {
        originalRequest.headers.Authorization = `Bearer ${token}`;
      }
      return api(originalRequest);
    }

    isRefreshing = true;
    originalRequest._retry = true;
    try {
      const { data } = await api.post("/auth/refresh");
      if (data?.token) {
        localStorage.setItem("token", data.token);
      }
      flushRefreshWaiters(data?.token);
      if (data?.token) {
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
      }
      return api(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem("token");
      flushRefreshWaiters(null);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;

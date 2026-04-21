import axios from "axios";

const AUTH_TOKEN_KEY = "authToken";
const AUTH_USER_KEY = "userInfo";
const AUTH_ROLE_KEY = "userRole";

const API_BASE_URL =
  (
    process.env.REACT_APP_API_URL ||
    process.env.REACT_APP_API_BASE_URL ||
    "http://127.0.0.1:8000"
  ).replace(/\/+$/, "");

const API = axios.create({
  baseURL: API_BASE_URL,
});

// TODO: migrate auth to HttpOnly SameSite cookies when backend cookie sessions are available.
export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getStoredUser() {
  const storedUser = localStorage.getItem(AUTH_USER_KEY);
  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    clearAuthSession();
    return null;
  }
}

export function setAuthSession(accessToken, user) {
  const minimalUser = {
    id: user.id,
    username: user.username,
    role: user.role,
    district: user.district || null,
    block: user.block || null,
  };

  localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(minimalUser));
  localStorage.setItem(AUTH_ROLE_KEY, minimalUser.role);
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_ROLE_KEY);
}

// Attach token if available
API.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// =========================
// Auth APIs
// =========================
export const loginUser = (username, password) =>
  API.post("/auth/login", { username, password });

export const registerUser = (userData) =>
  API.post("/auth/register", userData);

export const getCurrentUser = () => API.get("/auth/me");

export const logoutUser = () => {
  clearAuthSession();
  window.location.href = "/";
};

// =========================
// Farmer APIs
// =========================
export const registerFarmer = (farmerData) =>
  API.post("/farmers/register", farmerData);

export const checkEnrollmentStatus = (mobile) =>
  API.get(`/farmers/status/${encodeURIComponent(mobile)}`);

// =========================
// Dashboard APIs
// =========================
export const getKPIs = () => API.get("/dashboard/kpis");

export const getDistrictProduction = () => API.get("/production/district");

export const getMilletProduction = () => API.get("/production/millet");

export const getAllProduction = () => API.get("/production/all");

export const getProcurementKPIs = () => API.get("/procurement/kpis");

export const getAllProcurement = () => API.get("/procurement/all");

export default API;

import axios from "axios";

const API_BASE_URL =
  (
    process.env.REACT_APP_API_URL ||
    process.env.REACT_APP_API_BASE_URL ||
    "http://127.0.0.1:8000"
  ).replace(/\/+$/, "");

const API = axios.create({
  baseURL: API_BASE_URL,
});

// Attach token if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
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
  localStorage.removeItem("authToken");
  localStorage.removeItem("userInfo");
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

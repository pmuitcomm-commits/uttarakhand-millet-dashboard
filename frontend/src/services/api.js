/**
 * API service module - Centralizes HTTP access for the Millet MIS frontend.
 *
 * This file defines the Axios client, session persistence helpers, and API
 * wrappers used by authentication, farmer enrollment, production, and
 * procurement dashboard pages.
 */

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

// Security note: localStorage is currently used for bearer tokens because the
// backend exposes JWT responses. Migrate to HttpOnly SameSite cookies when
// backend cookie sessions are available.
export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Read and validate the persisted user session snapshot.
 *
 * @returns {Object|null} Minimal user object or null when storage is empty or
 * corrupted.
 */
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

/**
 * Persist the authenticated session received from the backend.
 *
 * @param {string} accessToken - JWT access token returned by the API.
 * @param {Object} user - Authenticated user object returned by the API.
 * @returns {void}
 */
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

/**
 * Remove all persisted authentication data from browser storage.
 *
 * @returns {void}
 */
export function clearAuthSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_ROLE_KEY);
}

// Attach the bearer token to API requests when a session is present.
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

export const requestLoginOtp = () => {
  // TODO: Wire this to the backend OTP request endpoint when available.
  // Expected backend behavior: send an OTP to the mobile/email mapped to identifier.
  return Promise.reject(
    new Error("OTP login is not configured yet. Backend OTP request endpoint is required."),
  );
};

export const verifyLoginOtp = () => {
  // TODO: Wire this to the backend OTP verification endpoint when available.
  // Expected backend response should match /auth/login: { access_token, token_type, user }.
  return Promise.reject(
    new Error("OTP login is not configured yet. Backend OTP verification endpoint is required."),
  );
};

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

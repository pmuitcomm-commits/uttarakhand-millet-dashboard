/**
 * API service module - Centralizes HTTP access for the Millet MIS frontend.
 *
 * This file defines the Axios client, session persistence helpers, and API
 * wrappers used by authentication, farmer enrollment, production, and
 * procurement dashboard pages.
 */

import axios from "axios";

const LEGACY_AUTH_KEYS = ["authToken", "userInfo", "userRole"];

const API_BASE_URL =
  (
    process.env.REACT_APP_API_URL ||
    process.env.REACT_APP_API_BASE_URL ||
    "http://localhost:8000"
  ).replace(/\/+$/, "");

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

/**
 * Persist the authenticated session received from the backend.
 *
 * @returns {void}
 */
export function setAuthSession() {
  clearAuthSession();
}

/**
 * Remove all persisted authentication data from browser storage.
 *
 * @returns {void}
 */
export function clearAuthSession() {
  LEGACY_AUTH_KEYS.forEach((key) => localStorage.removeItem(key));
}

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
  // Expected backend response should match /auth/login: { user }.
  return Promise.reject(
    new Error("OTP login is not configured yet. Backend OTP verification endpoint is required."),
  );
};

export const registerUser = (userData) =>
  API.post("/auth/register", userData);

export const getCurrentUser = () => API.get("/auth/me");

export const logoutUser = () =>
  API.post("/auth/logout").finally(() => {
    clearAuthSession();
  });

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

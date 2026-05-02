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

export const getDistrictBlockOfficers = () =>
  API.get("/auth/district/block-officers");

export const updateDistrictBlockOfficer = (userId, userData) =>
  API.put(`/auth/district/block-officers/${encodeURIComponent(userId)}`, userData);

// =========================
// Farmer APIs
// =========================
export const registerFarmer = (farmerData) =>
  API.post("/farmers/register", farmerData);

export const requestEnrollmentStatusOtp = (mobileNumber) =>
  API.post("/farmers/status/otp/request", { mobile_number: mobileNumber });

export const verifyEnrollmentStatusOtp = (mobileNumber, otp) =>
  API.post("/farmers/status/otp/verify", { mobile_number: mobileNumber, otp });

// =========================
// Dashboard APIs
// =========================
export const getKPIs = () => API.get("/dashboard/kpis");

export const getDistrictProduction = () => API.get("/production/district");

export const getMilletProduction = () => API.get("/production/millet");

export const getAllProduction = () => API.get("/production/all");

export const getProcurementKPIs = () => API.get("/procurement/kpis");

export const getAllProcurement = () => API.get("/procurement/all");

// =========================
// Officer Data Entry APIs
// =========================
function buildDataEntryParams(filters = {}) {
  return Object.fromEntries(
    Object.entries({
      district: filters.district,
      block: filters.block,
      section_key: filters.section_key || filters.sectionKey,
    }).filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== ""),
  );
}

export const getDataEntries = (scopeType, filters = {}) =>
  API.get(`/data-entries/${encodeURIComponent(scopeType)}`, {
    params: buildDataEntryParams(filters),
  });

export const saveDataEntries = (scopeType, entries, filters = {}) =>
  API.post(
    `/data-entries/${encodeURIComponent(scopeType)}`,
    { entries },
    { params: buildDataEntryParams(filters) },
  );

export const deleteDataEntry = (scopeType, entryId, filters = {}) =>
  API.delete(
    `/data-entries/${encodeURIComponent(scopeType)}/${encodeURIComponent(entryId)}`,
    { params: buildDataEntryParams(filters) },
  );

// =========================
// Block Scheme Data Entry APIs
// =========================
function buildBlockDataParams(filters = {}) {
  return Object.fromEntries(
    Object.entries({
      district: filters.district,
      block: filters.block,
    }).filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== ""),
  );
}

export const getBlockDataSchema = (tableName) =>
  API.get(`/block-data/${encodeURIComponent(tableName)}/schema`);

export const uploadBlockDataExcel = (tableName, file, filters = {}) => {
  const formData = new FormData();
  formData.append("file", file);

  return API.post(
    `/block-data/${encodeURIComponent(tableName)}/upload`,
    formData,
    {
      params: buildBlockDataParams(filters),
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
};

export const saveBlockDataRows = (tableName, rows, filters = {}) =>
  API.post(
    `/block-data/${encodeURIComponent(tableName)}`,
    { rows },
    { params: buildBlockDataParams(filters) },
  );

// =========================
// Monitoring APIs
// =========================
function buildMonitoringParams(filters = {}) {
  return Object.fromEntries(
    Object.entries({
      district: filters.district,
      block: filters.block,
      from: filters.from,
      to: filters.to,
    }).filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== ""),
  );
}

export const getMonitoringSections = (level, filters = {}) =>
  API.get(`/monitoring/${encodeURIComponent(level)}/sections`, {
    params: buildMonitoringParams(filters),
  });

export const getMonitoringTableRows = (level, tableName, filters = {}) =>
  API.get(
    `/monitoring/${encodeURIComponent(level)}/${encodeURIComponent(tableName)}`,
    {
      params: buildMonitoringParams(filters),
    },
  );

export default API;

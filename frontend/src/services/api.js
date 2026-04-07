import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export const getKPIs = () => API.get("/dashboard/kpis");

export const getDistrictProduction = () =>
  API.get("/production/district");

export const getMilletProduction = () =>
  API.get("/production/millet");

export const getAllProduction = () =>
  API.get("/production/all");

export const getProcurementKPIs = () => API.get("/procurement/kpis");

export const getAllProcurement = () => API.get("/procurement/all");
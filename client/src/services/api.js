import axios from "axios";

const STORAGE_KEY = "unireserve_auth";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const session = readSession();
  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
});

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function saveSession(token, user) {
  const session = { token, user };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function apiError(error) {
  return new Error(
    error.response?.data?.message ||
      (error.code === "ECONNABORTED"
        ? "The server took too long to respond."
        : "Unable to reach the server. Please try again.")
  );
}

export function getStoredUser() {
  return readSession()?.user || null;
}

export async function loginUser({ email, password }) {
  try {
    const response = await api.post("/auth/login", { email, password });
    const { token, user } = response.data.data;
    saveSession(token, user);
    return user;
  } catch (error) {
    throw apiError(error);
  }
}

export async function registerUser(details) {
  try {
    const response = await api.post("/auth/register", details);
    const { token, user } = response.data.data;
    saveSession(token, user);
    return user;
  } catch (error) {
    throw apiError(error);
  }
}

export async function updateUserProfile({ name, department }) {
  try {
    const response = await api.put("/users/profile", { name, department });
    const session = readSession();
    const user = response.data.data.user;
    saveSession(session.token, user);
    return user;
  } catch (error) {
    throw apiError(error);
  }
}

export async function getCurrentUser() {
  const session = readSession();
  if (!session?.token) return null;

  try {
    const response = await api.get("/auth/me");
    const user = response.data.data.user;
    saveSession(session.token, user);
    return user;
  } catch (error) {
    logoutUser();
    throw apiError(error);
  }
}

export function logoutUser() {
  localStorage.removeItem(STORAGE_KEY);
}

// ---- Admin endpoints ----------------------------------------------------

export async function getReservations() {
  try {
    const response = await api.get("/admin/reservations");
    return response.data.data;
  } catch (error) {
    throw apiError(error);
  }
}

export async function updateReservation(type, id, action) {
  try {
    const response = await api.post(`/admin/reservations/${type}/${id}/${action}`);
    return response.data.data;
  } catch (error) {
    throw apiError(error);
  }
}

export async function getReports(from, to, type) {
  try {
    const params = { from, to, type };
    const response = await api.get("/admin/reports", { params });
    return response.data.data.html;
  } catch (error) {
    throw apiError(error);
  }
}

export async function createEquipment(data) {
  try {
    const response = await api.post("/admin/equipment", data);
    return response.data.data;
  } catch (error) {
    throw apiError(error);
  }
}

export async function updateEquipment(id, data) {
  try {
    const response = await api.put(`/admin/equipment/${id}`, data);
    return response.data.data;
  } catch (error) {
    throw apiError(error);
  }
}

export async function deleteEquipment(id) {
  try {
    const response = await api.delete(`/admin/equipment/${id}`);
    return response.data.data;
  } catch (error) {
    throw apiError(error);
  }
}

export async function createBook(data) {
  try {
    const response = await api.post("/admin/books", data);
    return response.data.data;
  } catch (error) {
    throw apiError(error);
  }
}

export async function updateBook(id, data) {
  try {
    const response = await api.put(`/admin/books/${id}`, data);
    return response.data.data;
  } catch (error) {
    throw apiError(error);
  }
}

export async function deleteBook(id) {
  try {
    const response = await api.delete(`/admin/books/${id}`);
    return response.data.data;
  } catch (error) {
    throw apiError(error);
  }
}

// ---- Public endpoints ---------------------------------------------------

export async function getEquipment() {
  try {
    const response = await api.get("/equipment");
    return response.data.data;
  } catch (error) {
    throw apiError(error);
  }
}

export async function getBooks() {
  try {
    const response = await api.get("/books");
    return response.data.data;
  } catch (error) {
    throw apiError(error);
  }
}

export default api;

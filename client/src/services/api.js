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

export default api;

import axios from "axios";

const STORAGE_KEY = "unireserve_auth";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

function wait(milliseconds = 500) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function saveSession(user) {
  const session = {
    token: `mock-${Date.now()}`,
    user,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function nameFromEmail(email) {
  return email
    .split("@")[0]
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") || "UniReserve User";
}

export function getStoredUser() {
  return readSession()?.user || null;
}

export async function loginUser({ email, password }) {
  await wait();

  if (!EMAIL_PATTERN.test(email)) {
    throw new Error("Enter a valid university email address.");
  }
  if (password.length < 6) {
    throw new Error("Password must contain at least 6 characters.");
  }

  const existingUser = getStoredUser();
  const user = existingUser?.email === email
    ? existingUser
    : {
        id: `USR-${Date.now().toString().slice(-6)}`,
        name: nameFromEmail(email),
        email,
        department: "General Studies",
        role: "student",
      };

  saveSession(user);
  return user;
}

export async function registerUser(details) {
  await wait(650);

  const { name, email, department, role, password, confirmPassword } = details;
  if (!name.trim() || !department.trim()) {
    throw new Error("Name and department are required.");
  }
  if (!EMAIL_PATTERN.test(email)) {
    throw new Error("Enter a valid university email address.");
  }
  if (!["student", "faculty"].includes(role)) {
    throw new Error("Choose either student or faculty.");
  }
  if (password.length < 6) {
    throw new Error("Password must contain at least 6 characters.");
  }
  if (password !== confirmPassword) {
    throw new Error("Passwords do not match.");
  }

  const user = {
    id: `USR-${Date.now().toString().slice(-6)}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    department: department.trim(),
    role,
  };

  saveSession(user);
  return user;
}

export async function updateUserProfile({ name, department }) {
  await wait();

  const currentUser = getStoredUser();
  if (!currentUser) {
    throw new Error("Your session has expired. Please log in again.");
  }
  if (!name.trim() || !department.trim()) {
    throw new Error("Name and department are required.");
  }

  const updatedUser = {
    ...currentUser,
    name: name.trim(),
    department: department.trim(),
  };
  saveSession(updatedUser);
  return updatedUser;
}

export function logoutUser() {
  localStorage.removeItem(STORAGE_KEY);
}

export default api;

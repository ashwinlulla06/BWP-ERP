import { createContext, useContext, useEffect, useState } from "react";
import {
  getStoredUser,
  loginUser,
  logoutUser,
  registerUser,
  updateUserProfile,
} from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUser(getStoredUser());
    setIsLoading(false);
  }, []);

  const login = async (credentials) => {
    const authenticatedUser = await loginUser(credentials);
    setUser(authenticatedUser);
    return authenticatedUser;
  };

  const register = async (details) => {
    const registeredUser = await registerUser(details);
    setUser(registeredUser);
    return registeredUser;
  };

  const updateProfile = async (details) => {
    const updatedUser = await updateUserProfile(details);
    setUser(updatedUser);
    return updatedUser;
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

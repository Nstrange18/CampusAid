import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async (token) => {
    try {
      localStorage.setItem("campusaid_token", token);
      const profile = await api.get("/auth/me");
      setUser(profile);
      setError(null);
      return profile;
    } catch (err) {
      console.error("Error fetching user profile:", err);
      logout();
      throw err;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("campusaid_token");
      if (token) {
        try {
          await fetchProfile(token);
        } catch (err) {
          // Token expired or invalid
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.login(email, password);
      const profile = await fetchProfile(res.access_token);
      setLoading(false);
      return profile;
    } catch (err) {
      setLoading(false);
      setError(err.message || "Login failed");
      throw err;
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      // Register
      await api.post("/auth/register", userData);
      // Login immediately
      const profile = await login(userData.email, userData.password);
      return profile;
    } catch (err) {
      setLoading(false);
      setError(err.message || "Registration failed");
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("campusaid_token");
    setUser(null);
    setError(null);
  };

  const registerViaInvite = async (inviteData) => {
    setLoading(true);
    setError(null);
    try {
      // Register via invite
      await api.registerViaInvite(inviteData);
      // Login immediately with the new credentials
      const profile = await login(inviteData.email, inviteData.password);
      return profile;
    } catch (err) {
      setLoading(false);
      setError(err.message || "Admin registration failed");
      throw err;
    }
  };

  const refreshUser = async () => {
    const token = localStorage.getItem("campusaid_token");
    if (token) {
      await fetchProfile(token);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, registerViaInvite, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
export default AuthContext;

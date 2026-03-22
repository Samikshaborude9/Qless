// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { loginAPI, registerAPI, getMeAPI } from "../api/authAPI";
import { toast } from "sonner";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  // On app load — fetch current user if token exists
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          const data = await getMeAPI();
          setUser(data.user);
          setToken(storedToken);
        } catch (error) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await loginAPI(email, password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      return { success: true, role: data.user.role };
    } catch (error) {
      const message =
        error.response?.data?.message || "Login failed, please try again";
      toast.error(message);
      return { success: false };
    }
  };

  const register = async (name, email, password, role = "student") => {
    try {
      const data = await registerAPI(name, email, password, role);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      toast.success("Account created successfully!");
      return { success: true, role: data.user.role };
    } catch (error) {
      const message =
        error.response?.data?.message || "Registration failed, please try again";
      toast.error(message);
      return { success: false };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    toast.success("Logged out successfully");
  };

  const isAuthenticated = !!token && !!user;
  const isStudent = user?.role === "student";
  const isAdmin = user?.role === "admin";
  const isServer = user?.role === "server";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated,
        isStudent,
        isAdmin,
        isServer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export default AuthContext;
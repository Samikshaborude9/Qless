// src/api/authAPI.js
import axiosInstance from "./axiosInstance";

export const loginAPI = async (email, password) => {
  const response = await axiosInstance.post("/auth/login", { email, password });
  return response.data;
};

export const registerAPI = async (name, email, password, role = "student") => {
  const response = await axiosInstance.post("/auth/register", {
    name,
    email,
    password,
    role,
  });
  return response.data;
};

export const getMeAPI = async () => {
  const response = await axiosInstance.get("/auth/me");
  return response.data;
};

export const updateProfileAPI = async (data) => {
  const response = await axiosInstance.put("/auth/update-profile", data);
  return response.data;
};

export const createStaffAccountAPI = async (name, email, password) => {
  const response = await axiosInstance.post("/auth/create-staff", {
    name,
    email,
    password,
  });
  return response.data;
};

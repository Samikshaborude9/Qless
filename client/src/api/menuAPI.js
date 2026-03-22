// src/api/menuAPI.js
import axiosInstance from "./axiosInstance";

export const getMenuAPI = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.category) params.append("category", filters.category);
  if (filters.available) params.append("available", filters.available);
  if (filters.search) params.append("search", filters.search);

  const response = await axiosInstance.get(`/menu?${params.toString()}`);
  return response.data;
};

export const getMenuItemAPI = async (id) => {
  const response = await axiosInstance.get(`/menu/${id}`);
  return response.data;
};

export const addMenuItemAPI = async (data) => {
  const response = await axiosInstance.post("/menu", data);
  return response.data;
};

export const updateMenuItemAPI = async (id, data) => {
  const response = await axiosInstance.put(`/menu/${id}`, data);
  return response.data;
};

export const deleteMenuItemAPI = async (id) => {
  const response = await axiosInstance.delete(`/menu/${id}`);
  return response.data;
};

export const updateStockAPI = async (id, stock) => {
  const response = await axiosInstance.patch(`/menu/${id}/stock`, { stock });
  return response.data;
};
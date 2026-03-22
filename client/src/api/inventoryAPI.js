// src/api/inventoryAPI.js
import axiosInstance from "./axiosInstance";

export const getInventoryAPI = async (category = "") => {
  const params = category ? `?category=${category}` : "";
  const response = await axiosInstance.get(`/inventory${params}`);
  return response.data;
};

export const getLowStockAPI = async () => {
  const response = await axiosInstance.get("/inventory/low-stock");
  return response.data;
};

export const addIngredientAPI = async (data) => {
  const response = await axiosInstance.post("/inventory", data);
  return response.data;
};

export const updateStockAPI = async (id, data) => {
  const response = await axiosInstance.put(`/inventory/${id}`, data);
  return response.data;
};

export const deleteIngredientAPI = async (id) => {
  const response = await axiosInstance.delete(`/inventory/${id}`);
  return response.data;
};

export const updateThresholdAPI = async (id, lowStockThreshold) => {
  const response = await axiosInstance.patch(`/inventory/${id}/threshold`, {
    lowStockThreshold,
  });
  return response.data;
};
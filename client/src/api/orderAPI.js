// src/api/orderAPI.js
import axiosInstance from "./axiosInstance";

export const placeOrderAPI = async (items, couponCode = "") => {
  const response = await axiosInstance.post("/orders", { items, couponCode });
  return response.data;
};

export const getMyOrdersAPI = async () => {
  const response = await axiosInstance.get("/orders/my-orders");
  return response.data;
};

export const getAllOrdersAPI = async (status = "") => {
  const params = status ? `?status=${status}` : "";
  const response = await axiosInstance.get(`/orders${params}`);
  return response.data;
};

export const updateOrderStatusAPI = async (id, status) => {
  const response = await axiosInstance.patch(`/orders/${id}/status`, { status });
  return response.data;
};

export const getReadyOrdersAPI = async () => {
  const response = await axiosInstance.get("/orders/ready");
  return response.data;
};

export const markPickedUpAPI = async (id) => {
  const response = await axiosInstance.patch(`/orders/${id}/pickup`);
  return response.data;
};

export const getLiveOccupancyAPI = async () => {
  const response = await axiosInstance.get("/orders/occupancy");
  return response.data;
};

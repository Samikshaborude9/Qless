// src/api/serverAPI.js
import axiosInstance from "./axiosInstance";

export const getReadyOrdersAPI = async () => {
  const response = await axiosInstance.get("/orders/ready");
  return response.data;
};

export const markPickedUpAPI = async (id) => {
  const response = await axiosInstance.patch(`/orders/${id}/pickup`);
  return response.data;
};
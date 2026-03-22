// src/api/paymentAPI.js
import axiosInstance from "./axiosInstance";

export const createPaymentOrderAPI = async (orderId) => {
  const response = await axiosInstance.post("/payments/create-order", {
    orderId,
  });
  return response.data;
};

export const verifyPaymentAPI = async (
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  orderId
) => {
  const response = await axiosInstance.post("/payments/verify", {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    orderId,
  });
  return response.data;
};
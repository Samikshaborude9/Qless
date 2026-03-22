// src/api/analyticsAPI.js
import axiosInstance from "./axiosInstance";

export const getOverviewAPI = async () => {
  const response = await axiosInstance.get("/analytics/overview");
  return response.data;
};

export const getPopularDishesAPI = async () => {
  const response = await axiosInstance.get("/analytics/popular-dishes");
  return response.data;
};

export const getPeakHoursAPI = async () => {
  const response = await axiosInstance.get("/analytics/peak-hours");
  return response.data;
};

export const getRevenueAPI = async () => {
  const response = await axiosInstance.get("/analytics/revenue");
  return response.data;
};

export const getFeedbackSummaryAPI = async () => {
  const response = await axiosInstance.get("/analytics/feedback");
  return response.data;
};
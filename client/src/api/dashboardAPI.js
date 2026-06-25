import axiosInstance from "./axiosInstance";

export const getDashboardStatsAPI = async () => {
  const response = await axiosInstance.get("/dashboard/stats");
  return response.data;
};

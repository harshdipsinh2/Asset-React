// services/requestService.js
import api from "./api";
import { message } from "antd";

// Get all employees
export const getEmployees = async () => {
  try {
    const response = await api.get("/Employee");
    return response.data; // No need for `{ data: response.data || [] }`
  } catch (error) {
    message.error(error.response?.data?.message || "Failed to fetch employees.");
    return [];
  }
};

// Get assets by category
export const getAssetsByCategory = async (category) => {
  try {
    let response;
    if (category === "Physical") {
      response = await api.get("/PhysicalAsset");
    } else if (category === "Software") {
          const response = await api.get("/SoftwareAsset");
    return response.data || []; // Ensure an array is always returned
    } else {
      throw new Error("Invalid category specified.");
    }

    return response.data?.data || response.data || []; // Ensure correct data structure
  } catch (error) {
    message.error(error.response?.data?.message || "Failed to fetch assets.");
    return [];
  }
};



// Request an asset
export const requestAsset = async (requestData) => {
  try {
    const response = await api.post("/AssetRequest/request", requestData);
    message.success(response.data.message || "Asset requested successfully!");
    return response.data;
  } catch (error) {
    message.error(error.response?.data?.message || "Failed to request asset.");
    throw error;
  }
};
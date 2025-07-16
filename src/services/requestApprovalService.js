import api from "./api";
import { message } from "antd";

// Get all employees
export const getEmployees = async () => {
  try {
    const response = await api.get("/Employee");

    if (!response.data || !Array.isArray(response.data.data)) {
      throw new Error("Invalid employee data format.");
    }
    return response.data.data; // Ensuring it returns an array
  } catch (error) {
    console.error("Error fetching employees:", error);
    message.error("Failed to fetch employees.");
    return []; // Return an empty array to prevent crashes
  }
};

// Fetch pending asset requests
export const getPendingRequests = async () => {
  try {
    const response = await api.get("/AssetRequest/pending");
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    return [];
  }
};

// Fetch request history
export const getRequestHistory = async () => {
  try {
    const response = await api.get("/AssetRequest/history");
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    return [];
  }
};

// Approve asset request
export const approveAssetRequest = async (requestId, assetId) => {
  try {
    const response = await api.post(`/AssetRequest/approve/${requestId}/${assetId}`);
    // message.success(response.data?.message || "Asset request approved!");
    return response.data;
  } catch (error) {
    console.error("Error approving asset request:", error);
    message.error("Failed to approve request.");
    throw error;
  }
};

// Reject asset request
export const rejectAssetRequest = async (requestId, assetId) => {
  try {
    const response = await api.post(`/AssetRequest/reject/${requestId}/${assetId}`);
    message.destroy();
    message.success(response.data?.message || "Asset request rejected!");
    return response.data;
  } catch (error) {
    console.error("Error rejecting asset request:", error);
    message.error("Failed to reject request.");
    throw error;
  }
};

// Fetch assets by category
export const getAssetsByCategory = async (category) => {
  try {
    if (category !== "Physical") {
      message.error("Invalid asset category specified.");
      return [];
    }

    const response = await api.get("/PhysicalAsset");

    if (!response.data || !Array.isArray(response.data.data)) {
      throw new Error("Invalid asset data format.");
    }
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching ${category} assets:`, error);
    message.error(`Failed to fetch ${category} assets.`);
    return [];
  }
};

// Fetch all assets (physical only)
export const getAssets = async () => {
  try {
    const response = await api.get("/PhysicalAsset");

    const physicalData = Array.isArray(response.data?.data) ? response.data.data : [];
    return physicalData;
  } catch (error) {
    console.error("Error fetching assets:", error);
    message.error("Failed to fetch assets.");
    return [];
  }
};

import api from "./api";
import { message } from "antd";


// Fetch user role
export const getUserRole = async () => {
  try {
    const response = await api.get("/User/profile");
    return response.data.roleID;
  } catch (error) {
    message.error("Failed to fetch user role.");
    return null;
  }
};

// Fetch software assets
export const getSoftwareAssets = async () => {
  try {
    const response = await api.get("/SoftwareAsset");
    return Array.isArray(response.data.data) ? response.data.data : [];
  } catch (error) {
    message.error("Failed to fetch software assets.");
    return [];
  }
};

// Add a software asset
export const addSoftwareAsset = async (asset) => {
  try {
    await api.post("/SoftwareAsset", asset);
    message.success("Software asset added successfully.");
    return true;
  } catch (error) {
    message.error("Failed to add software asset.");
    return false;
  }
};

// Get software asset by ID
export const getSoftwareAssetById = async (id) => {
  try {
    const response = await api.get(`/SoftwareAsset/${id}`);
    return response.data.data;
  } catch (error) {
    message.error("Failed to fetch software asset details.");
    return null;
  }
};

// Update a software asset
export const updateSoftwareAsset = async (id, asset) => {
  try {
    await api.put(`/SoftwareAsset/${id}`, asset);
    message.success("Software asset updated successfully.");
    return true;
  } catch (error) {
    message.error("Failed to update software asset.");
    return false;
  }
};


// Delete a software asset
export const deleteSoftwareAsset = async (id, fetchAssets) => {
  try {
    const response = await api.delete(`/SoftwareAsset/${id}`);
    if (response.status === 200 || response.status === 204) {
      message.success("Software asset deleted successfully.");
      fetchAssets(); // Refresh the asset list
    } else {
      message.error("Failed to delete software asset.");
    }
  } catch (error) {
    message.error("Failed to delete software asset.");
  }
};


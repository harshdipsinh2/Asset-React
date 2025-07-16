import api from "./api";
import { message } from "antd";

export const getUserRole = async () => {
  try {
    const response = await api.get("/User/profile");
    return response.data.roleID;
  } catch (error) {
    message.error("Failed to fetch user role.");
    return null;
  }
};

export const getPhysicalAssets = async () => {
  try {
    const response = await api.get("/PhysicalAsset");
    return Array.isArray(response.data.data) ? response.data.data : []; // Ensure it's an array
  } catch (error) {
    message.error("Failed to fetch assets.");
    return [];
  }
};

export const getPhysicalAssetById = async (id) => {
  try {
    const response = await api.get(`/PhysicalAsset/${id}`);
    return response.data;
  } catch (error) {
    message.error("Failed to fetch asset details.");
    return null;
  }
};


export const addPhysicalAsset = async (assetData) => {
  try {
    const response = await api.post("/PhysicalAsset", assetData);

    // Ensure the request was successful (Check response status)
    if (response.status === 200 || response.status === 201) {
      message.success("Asset added successfully.");
      return true; // Success
    } else {
      throw new Error("Failed to add asset."); // Force error handling
    }
  } catch (error) {
    message.error("Failed to add asset.");
    console.error("Add Asset Error:", error.response?.data || error.message);
    return false; // Failure
  }
};


export const updatePhysicalAsset = async (id, assetData, fetchAssets) => {
  try {
    await api.put(`/PhysicalAsset/${id}`, assetData);
    message.success("Physical Asset updated successfully."); //  Success message

    if (fetchAssets) {
      try {
        await fetchAssets(); // Try refreshing the asset list
      } catch (fetchError) {
        console.warn("Failed to refresh asset list:", fetchError);
        message.warning("Asset updated, but failed to refresh list.");
      }
    }
  } catch (error) {
    message.error("Failed to update asset."); //  Show this only if the update fails
  }
};


export const deletePhysicalAsset = async (id, fetchAssets) => {
  try {
    const response = await api.delete(`/PhysicalAsset/${id}`);
    if (response.status === 200 || response.status === 204) {
      message.success("Asset deleted successfully.");
      fetchAssets(); // Refresh the asset list
    } else {
      message.error("Failed to delete asset.");
    }
  } catch (error) {
    message.error("Failed to delete asset.");
  }
};

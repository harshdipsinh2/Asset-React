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

// Get all Physical
export const getPhysicalAssets = async () => {
  try {
    const response = await api.get("/PhysicalAsset");
    return response.data; // No need for `{ data: response.data || [] }`
  } catch (error) {
    message.error(error.response?.data?.message || "Failed to fetch physical assets.");
    return [];
  }
};


// Assign physical asset to employee
export const assignPhysicalAsset = async (employeeId, assetIds) => {
  try {
    const assignedDate = new Date().toISOString().split("T")[0]; // Get today's date in 'YYYY-MM-DD' format

    const response = await api.post(`/EmployeePhysicalAsset/assign-multiple`, {
      employeeId,
      assetIds,
      assignedDate, // Send assignedDate
    });

    message.success(response.data.message || "Assets assigned successfully!");
    return response;
  } catch (error) {
    message.error(error.response?.data?.message || "Failed to assign assets.");
    throw error;
  }
};

// Transfer physical asset from one employee to another
export const transferPhysicalAsset = async (oldEmployeeId, newEmployeeId, assetId) => {
  try {
    const response = await api.post(`/EmployeePhysicalAsset/transfer`, {
      oldEmployeeId,
      newEmployeeId,
      assetId,
    });

    message.success(response.data.message || "Asset transferred successfully!");
    return response;
  } catch (error) {
    message.error(error.response?.data?.message || "Failed to transfer asset.");
    return null;
  }
};


// Get assigned physical assets
export const getAssignedPhysicalAssets = async () => {
  try {
    const response = await api.get("/EmployeePhysicalAsset/all");
    return response.data || []; //  Now always returns an array
  } catch (error) {
    message.error(error.response?.data?.message || "Failed to fetch assigned assets.");
    return []; //  Returns an empty array on failure
  }
};

// Get assigned assets for a specific employee
export const getEmployeeAssignedAssets = async (employeeId) => {
  try {
    const response = await api.get(`/EmployeePhysicalAsset/${employeeId}`);
    return response.data || []; // Ensure it always returns an array
  } catch (error) {
    message.error(error.response?.data?.message || "Failed to fetch employee assets.");
    return [];
  }
};

// Unassign physical asset from employee
export const unassignPhysicalAsset = async (employeeId, assetId) => {
  try {
    const response = await api.delete(`/EmployeePhysicalAsset/DeletePhysicalAssetAssignment/${employeeId}/${assetId}`);
    // message.success(response.data.message || "Asset unassigned successfully!");
    return response;
  } catch (error) {
    message.error(error.response?.data?.message || "Failed to unassign asset.");
    return null;
  }
};

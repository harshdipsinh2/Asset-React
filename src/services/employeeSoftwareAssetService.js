import api from "./api";
import { message } from "antd";

// Get all employees
export const getEmployees = async () => {
  try {
    const response = await api.get("/Employee");
    return response.data || []; // Ensure an array is always returned
  } catch (error) {
    message.error(error.response?.data?.message || "Failed to fetch employees.");
    return [];
  }
};

// Get all software assets
export const getSoftwareAssets = async () => {
  try {
    const response = await api.get("/SoftwareAsset");
    return response.data || []; // Ensure an array is always returned
  } catch (error) {
    message.error(error.response?.data?.message || "Failed to fetch software assets.");
    return [];
  }
};

// Get assigned software assets
export const getEmployeeSoftwareAssets = async () => {
  try {
    const response = await api.get("/EmployeeSoftwareAsset");
    return response.data || [];
  } catch (error) {
    message.error(error.response?.data?.message || "Failed to fetch assigned software assets.");
    return [];
  }
};

// Get assigned software assets for a specific employee
export const getEmployeeAssignedSoftwareAssets = async (employeeId) => {
  try {
    const response = await api.get(`/EmployeeSoftwareAsset/${employeeId}`);
    return response.data || []; // Ensure it always returns an array
  } catch (error) {
    message.error(error.response?.data?.message || "Failed to fetch employee software assets.");
    return [];
  }
};

// Assign software asset to employee
export const assignMultipleSoftwareAssets = async (employeeId, softwareIds) => {
  try {
    const response = await api.post(
      `/EmployeeSoftwareAsset`,
      softwareIds, // Send array in body
      {
        params: { employeeId },
      }
    );
    message.success(response.data || "Software assets assigned successfully!");
    return response;
  } catch (error) {
    message.error(error.response?.data || "Failed to assign software assets.");
    throw error;
  }
};


// Unassign software asset from employee
export const unassignSoftwareAsset = async (employeeId, softwareId) => {
  try {
    if (!employeeId || !softwareId) {
      throw new Error("Employee ID or Software ID is missing.");
    }

    const response = await api.delete(
      `/EmployeeSoftwareAsset/DeleteSoftwareAssetAssignment/${employeeId}/${softwareId}`
    );
    

    // message.success(response.data.message || "Software asset unassigned successfully!");
    return response;
  } catch (error) {
    console.error("Unassign Error:", error); // Log full error for debugging
    message.error(error.response?.data?.message || "Failed to unassign software asset.");
    throw error;
  }
};









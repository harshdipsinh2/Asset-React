import api from "./api";
import { message } from "antd";

export const fetchUserCount = async (setUserCount) => {
  try {
    const response = await api.get("/User/get-users");
    setUserCount(response.data.length);
  } catch (error) {
    console.log("User does not have permission to view the users.");
  }
};

export const fetchRoleCount = async (setRoleCount) => {
  try {
    const response = await api.get("/RoleMaster");
    setRoleCount(response.data.data.length);
  } catch (error) {
  //  message.error("Failed to fetch roles count");
  }
};

export const fetchEmployeeCount = async (setEmployeeCount) => {
  try {
    const response = await api.get("/Employee"); // Fetch all employees
    setEmployeeCount(response.data.data.length); // Count total employees
  } catch (error) {
//    console.error("Error fetching employee count:", error);
  }
};

export const fetchPhysicalAssetCount = async (setPhysicalAssetCount) => {
  try {
    const response = await api.get("/PhysicalAsset"); // Fetch all physical assets
    setPhysicalAssetCount(response.data.data.length);
  } catch (error) {
//    console.error("Error fetching physical asset count:", error);
  }
};

export const getPhysicalAssets = async () => {
  try {
    const response = await api.get("/PhysicalAsset");
    return Array.isArray(response.data.data) ? response.data.data : [];
  } catch (error) {
  //  console.error("Failed to fetch physical assets:", error);
    return [];
  }
};



export const fetchSoftwareAssetCount = async (setSoftwareAssetCount) => {
  try {
    const response = await api.get("/SoftwareAsset"); // Fetch all software assets
    setSoftwareAssetCount(response.data.data.length);
  } catch (error) {
//    console.error("Error fetching software asset count:", error);
  }
};

// Fetch total assigned physical assets
export const fetchAssignedPhysicalAssetCount = async (setAssignedPhysicalAssetCount) => {
  try {
    const response = await api.get("/EmployeePhysicalAsset/all");
    setAssignedPhysicalAssetCount(response.data.data.length);
  } catch (error) {
//    console.error("Error fetching assigned physical asset count:", error);
  }
};

// Fetch total assigned software assets
export const fetchAssignedSoftwareAssetCount = async (setAssignedSoftwareAssetCount) => {
  try {
    const response = await api.get("/EmployeeSoftwareAsset");
    setAssignedSoftwareAssetCount(response.data.data.length);
  } catch (error) {
//    console.error("Error fetching assigned software asset count:", error);
  }
};


export const fetchUserProfile = async (setUsername, setEmployeeID, setRoleID) => {
  try {
    const response = await api.get("/User/profile");
    
    if (response.data) {
      setUsername(response.data.username);
      setRoleID(response.data.roleID);
      setEmployeeID(response.data.employeeID); // Ensure this is correctly set
    } else {
      console.error("Profile data is empty");
    }
  } catch (error) {
  //  console.error("Failed to fetch profile:", error);
  }
};

export const fetchUserProfiles = async (setUsername, setRoleID, setEmployeeID, setEmail) => {
  try {
    const response = await api.get("/User/profile");

    if (response.data) {
      setUsername(response.data.username);
      setRoleID(response.data.roleID);
      setEmployeeID(response.data.employeeID);
      setEmail(response.data.email); // <-- Set the email here
    } else {
      console.error("Profile data is empty");
    }
  } catch (error) {
  //  console.error("Failed to fetch profile:", error);
  }
};



export const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("roleID");
  message.success("Logged out successfully!");
  window.location.href = "/login";
};
import api from "./api";
import { message } from "antd";

// Get all employees
export const getEmployees = async () => {
  try {
    const response = await api.get("/Employee");
    return response.data;  
  } catch (error) {
    message.error(error.response?.data?.message || "Failed to fetch employees.");
    return { data: [] }; 
  }
};

// Insert new employee
export const addEmployee = async (employeeData) => {
  try {
    const response = await api.post("/Employee", employeeData);
    return response.data;  
  } catch (error) {
    message.error(error.response?.data?.message || "Failed to add employee.");
    return null; 
  }
};

// Delete employee by ID
export const deleteEmployeeById = async (employeeId) => {
  try {
    const response = await api.delete(`/Employee/${employeeId}`);
    message.destroy();
    message.success(response.data.message || "Employee deleted successfully!");
    return response.data;  
  } catch (error) {
    message.destroy();
    message.error(error.response?.data?.message || "Failed to delete employee.");
    return null; 
  }
};

// Get employee by ID for update
export const getEmployeeById = async (employeeId) => {
  try {
    const response = await api.get(`/Employee/${employeeId}`);
    return response.data;  
  } catch (error) {
    message.error(error.response?.data?.message || "Failed to fetch employee details.");
    return null;
  }
};

// PATCH : Update employee Email ID
export const updateEmployeeEmail = async (employeeId, emailId) => {
  try {
    const response = await api.patch(`/Employee/${employeeId}`, { emailId });
    return response.data;
  } catch (error) {
    console.error("Error updating employee email:", error.response?.data || error);
    message.error(error.response?.data?.message || "Failed to update employee email.");
    throw error;
  }
};

// Update employee details
export const updateEmployee = async (employeeId, employeeData) => {
  try {
    const response = await api.put(`/Employee/${employeeId}`, employeeData);
    message.success(response.data.message || "Employee updated successfully!");
    return response.data;
  } catch (error) {
    message.error(error.response?.data?.message || "Failed to update employee.");
    throw error; 
  }
};

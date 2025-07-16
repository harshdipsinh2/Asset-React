import api from "./api";
import { message } from "antd";

export const getUserRole = async () => {
  try {
    const response = await api.get("/User/profile");
    return response.data.roleID;
  } catch (error) {
    message.error("Session expired. Please log in again.");
    localStorage.removeItem("token");
    window.location.href = "/";
    return null;
  }
};

export const getUsers = async () => {
  try {
    const response = await api.get("/User/get-users");
    return response.data.sort((a, b) => a.employeeID - b.employeeID); // Sort by employeeID
  } catch (error) {
    message.error("Failed to fetch users");
    return [];
  }
};

export const addUser = async (newUser, onSuccess) => {
  try {
    const response = await api.post("/User/add-user", newUser);
    message.success(response.data.message);
    if (onSuccess) onSuccess(); // Optional success callback (e.g., to refresh user list)
    return response.data;
  } catch (error) {
    message.error(error.response?.data?.message || "Failed to add new user.");
    return null;
  }
};

export const deleteUserByEmail = async (email, fetchUsers, isSelfDelete = false) => {
  try {
    const response = await api.delete(`/User/delete/${email}`);
    message.success(response.data.message);

    if (isSelfDelete) {
      localStorage.removeItem("token"); // Remove token on self delete
      window.location.href = "/login";  // Redirect to login
    } else {
      fetchUsers(); // Refresh list for admin
    }
  } catch (error) {
    message.error(error.response?.data?.message || "Failed to delete user.");
  }
};

export const updateUserByEmail = async (email, updatedUser, onSuccess) => {
  try {
    const response = await api.put(`/User/update-user/${email}`, updatedUser);
    message.success(response.data.message);
    if (onSuccess) onSuccess(); // Optional success callback
    return response.data;
  } catch (error) {
    message.error(error.response?.data?.message || "Failed to update user.");
    return null;
  }
};






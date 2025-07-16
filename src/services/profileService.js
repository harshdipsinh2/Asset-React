import api from "./api"; 
import { Tag } from "antd";

export const fetchUserProfile = async () => {
  try {
    const response = await api.get("/User/profile");
    return response.data;
  } catch (error) {
    return null;
  }
};

export const getRoleTag = (roleID) => {
  const roles = {
    1: { label: "Super Admin", color: "red" },
    2: { label: "Admin", color: "blue" },
    3: { label: "Employee", color: "green" },
  };
  return <Tag color={roles[roleID]?.color}>{roles[roleID]?.label}</Tag>;
};

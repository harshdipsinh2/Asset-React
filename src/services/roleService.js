import api from "./api";

const getRoles = async () => {
  try {
    const response = await api.get("/RoleMaster");
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

const getUserRole = async () => {
  try {
    const response = await api.get("/User/profile");
    return response.data.roleID;
  } catch (error) {
    throw error;
  }
};

const addRole = async (roleData) => {
  try {
    const response = await api.post("/RoleMaster", roleData);
    return response.data.message;
  } catch (error) {
    throw error;
  }
};

const deleteRole = async (roleId) => {
  try {
    const response = await api.delete(`/RoleMaster/${roleId}`);
    return response.data.message;
  } catch (error) {
    throw error;
  }
};

export { getRoles, getUserRole, addRole, deleteRole };

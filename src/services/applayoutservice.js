export const fetchUserProfile = async (setUsername, setRoleID) => {
    try {
      const response = await api.get("/User/profile");
      
      if (response.data) {
        setUsername(response.data.username);
        setRoleID(response.data.roleID);
      } else {
        console.error("Profile data is empty");
      }
    } catch (error) {
     // console.error("Failed to fetch profile:", error);
    }
  };
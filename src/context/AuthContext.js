import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  // Optionally, you can also manage roleId and email in the context state
  // const [roleId, setRoleId] = useState(localStorage.getItem("roleID") || null);
  // const [email, setEmail] = useState(localStorage.getItem("email") || null);

  const login = (token, roleID, email) => {
    localStorage.setItem("token", token);
    localStorage.setItem("roleID", roleID);
    localStorage.setItem("email", email);
    setIsAuthenticated(true);
    // setRoleId(roleID);
    // setEmail(email);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("roleID");
    localStorage.removeItem("email");
    setIsAuthenticated(false);
    // setRoleId(null);
    // setEmail(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
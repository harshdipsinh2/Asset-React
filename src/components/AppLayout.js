import React, { useState, useEffect } from "react";
import { Layout, Menu, Avatar, Button, Dropdown, message, Modal } from "antd";
import {UserOutlined, TeamOutlined, HomeOutlined, IdcardOutlined, LaptopOutlined, CloudDownloadOutlined, CloudSyncOutlined, DesktopOutlined, ShoppingCartOutlined,
        CheckCircleOutlined, FolderOpenOutlined, CloudOutlined, BarChartOutlined,} from "@ant-design/icons";
import { Outlet, useNavigate } from "react-router-dom";
import { fetchUserProfiles, handleLogout } from "../services/dashboardService";
import { deleteUserByEmail } from "../services/userService";
import logoImage from "../images/download3.png";
import { checkSubscriber } from "../services/subscriptionService";

const { Header, Sider, Content } = Layout;
const AppLayout = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [username, setUsername] = useState("");
  const [roleID, setRoleID] = useState(null);
  const [employeeID, setEmployeeID] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [email, setEmail] = useState("");
  
  // Fetch profile once on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        await fetchUserProfiles(setUsername, setRoleID, setEmployeeID, setEmail);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    fetchProfile();
  }, []);
  
  // Wait for email and then check subscription
  useEffect(() => {
    const checkSubscription = async () => {
      if (email) {
        try {
          const exists = await checkSubscriber(email);
          setIsSubscribed(exists);
        } catch (err) {
          console.error("Subscription check failed:", err);
          setIsSubscribed(false);
        }
      }
    };
    checkSubscription();
  }, [email]);
  
  

  const getAvatarColor = (roleID) => {
    const roleColors = {
      1: "#EE4B2B",
      2: "#1890ff",
      3: "#52c41a",
    };
    return roleColors[roleID] || "#d9d9d9";
  };

  const handleDeleteAccount = async () => {
    console.log("Attempting to delete user with email:", email); // Log the email
    if (!email) {
      message.error("Email is missing. Please refresh and try again.");
      return;
    }

    Modal.confirm({
      title: "Delete Account",
      content: "Are you sure you want to delete your account? This action cannot be undone!",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        console.log("Deleting user with email:", email); // Log the email before deletion
        await deleteUserByEmail(email, null, true);
      },
    });
  };

  const avatarMenu = (
    <Menu>
      <Menu.Item key="profile" onClick={() => navigate("/profile")}>
        Profile
      </Menu.Item>
      <Menu.Item key="delete-account" onClick={handleDeleteAccount} danger>
        Delete Account
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        width={250}
        onCollapse={setCollapsed}
        className="dashboard-sider"
      >
        <div className="logo">
          <img
            src={logoImage}
            alt="Logo"
            style={{
              width: collapsed ? "40px" : "30%",
              height: "auto",
              transition: "width 0.3s ease-in-out",
            }}
          />
        </div>

        <Menu theme="dark" mode="inline">
          <Menu.Item key="1" icon={<HomeOutlined />} onClick={() => navigate("/dashboard")}>
            Dashboard
          </Menu.Item>
          {roleID === 1 && isSubscribed && (
            <Menu.Item key="2" icon={<UserOutlined />} onClick={() => navigate("/users")}>
              Users
            </Menu.Item>
          )}
          {roleID === 1 && isSubscribed && (
            <Menu.Item key="3" icon={<TeamOutlined />} onClick={() => navigate("/roles")}>
              Roles
            </Menu.Item>
          )}
          {(roleID === 1 || roleID === 2) && (
            <Menu.Item key="4" icon={<IdcardOutlined />} onClick={() => navigate("/employee-list")}>
              Employees
            </Menu.Item>
          )}
          <Menu.Item key="5" icon={<LaptopOutlined />} onClick={() => navigate("/physicalasset-list")}>
            Physical Assets
          </Menu.Item>
          <Menu.Item key="6" icon={<CloudDownloadOutlined />} onClick={() => navigate("/softwareasset-list")}>
            Software
          </Menu.Item>
          {roleID === 1 && (
            <Menu.Item key="7" icon={<DesktopOutlined />} onClick={() => navigate("/assign-physical-asset")}>
              Assign Physical Assets
            </Menu.Item>
          )}
          {roleID === 1 && (
            <Menu.Item key="8" icon={<CloudSyncOutlined />} onClick={() => navigate("/assign-software-asset")}>
              Assign Software
            </Menu.Item>
          )}
          {(roleID === 2 || roleID === 3) &&  (
            <Menu.Item key="9" icon={<ShoppingCartOutlined />} onClick={() => navigate("/request-asset")}>
              Request Asset
            </Menu.Item>
          )}
          {roleID === 1 && isSubscribed && (
            <Menu.Item key="10" icon={<CheckCircleOutlined />} onClick={() => navigate("/approve-requests")}>
              Approve Requests
            </Menu.Item>
          )}
          {(roleID === 2 || roleID === 3) && employeeID &&(
            <>
              <Menu.Item key="11" icon={<FolderOpenOutlined />} onClick={() => navigate("view-physical-asset")}>
                My Assets
              </Menu.Item>
              <Menu.Item key="12" icon={<CloudOutlined />} onClick={() => navigate("/view-software-asset")}>
                My Software
              </Menu.Item>
            </>
          )}
          {roleID === 1 && isSubscribed && (
            <Menu.Item key="13" icon={<BarChartOutlined />} onClick={() => navigate("/analysis")}>
              Analysis
            </Menu.Item>
          )}
        </Menu>
      </Sider>

      <Layout>
        <Header className="dashboard-header">
          <span className="dashboard-title">Asset Management System</span>
          <div className="dashboard-actions">
            <Dropdown overlay={avatarMenu} trigger={["click"]} placement="bottomRight">
              <Avatar
                style={{
                  backgroundColor: getAvatarColor(roleID),
                  cursor: "pointer",
                  userSelect: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                size="large"
              >
                {username ? username.charAt(0).toUpperCase() : "U"}
              </Avatar>
            </Dropdown>
            <Button type="primary" danger onClick={handleLogout} style={{ marginLeft: "10px" }}>
              Logout
            </Button>
          </div>
        </Header>

        <Content className="dashboard-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
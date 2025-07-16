import React, { useEffect, useState, useMemo } from "react";
import { Button, Card, Row, Col, Typography, message, Spin, Divider, List } from "antd";
import { CheckCircleOutlined, UserOutlined, AppstoreOutlined, LockOutlined, DeploymentUnitOutlined,
         TeamOutlined, BarChartOutlined, } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { createSubscriptionSession, checkSubscriber } from "../../services/subscriptionService";
import { fetchUserProfile } from "../../services/profileService";

const { Title, Paragraph, Text } = Typography;

const Subscription = ({ onBasicAccess }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showPage, setShowPage] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  
  const basicFeatures = useMemo(() => [
    { title: "Asset Assignment (Physical & Software)", icon: <DeploymentUnitOutlined style={{ color: "#1890ff" }} /> },
    { title: "Employee Management", icon: <UserOutlined style={{ color: "#52c41a" }} /> },
    { title: "Asset Management", icon: <AppstoreOutlined style={{ color: "#faad14" }} /> },
    { title: "Restricted User & Role Access", icon: <LockOutlined style={{ color: "#faad14" }} /> },
  ], []);
  
  const premiumFeatures = useMemo(() => [
    { title: "Core Features: Asset & Employee Management", icon: <DeploymentUnitOutlined style={{ color: "#1890ff" }} /> },
    { title: "Full User & Role Management", icon: <TeamOutlined style={{ color: "#722ed1" }} /> },
    { title: "Approve/Reject Asset Requests", icon: <CheckCircleOutlined style={{ color: "#52c41a" }} /> },
    { title: "Analytics & Reports", icon: <BarChartOutlined style={{ color: "#1890ff" }} /> },
  ], []);
  


  useEffect(() => {
    const checkAccess = async () => {
      try {
        const profileData = await fetchUserProfile();
        if (profileData && profileData.email) {
          setUserEmail(profileData.email);

          // ✅ NEW: If employeeID exists, allow basic access
          if (profileData.employeeID) {
            onBasicAccess();  // this could set a global state or context
            navigate("/dashboard");
            return; // exit early
          }

          const isSubscribed = await checkSubscriber(profileData.email);
          if (isSubscribed) {
            navigate("/dashboard");
          } else {
            setShowPage(true);
          }
        }
  else  {
          message.error("Could not retrieve user profile. Please login again.");
          navigate("/login");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        message.error("Failed to fetch user profile. Please try again.");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [navigate, onBasicAccess]);

  const handlePremiumSubscribe = async () => {
    if (!userEmail) {
      message.error("Email is not available. Please try again later.");
      return;
    }
  
    try {
      const response = await createSubscriptionSession(userEmail);
  
      if (response?.url) {
        // Redirect to Stripe checkout page
        window.location.href = response.url;
      } else {
      }
    } catch (error) {
      console.error("Subscription failed:", error);
      message.error("Subscription failed. Please try again.");
    }
  };

  const handleBasicClick = () => {
    onBasicAccess();
    navigate("/dashboard");
  };

  if (!showPage) {
    return null;
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "20%" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: "3rem" }}>
      <Title level={2} style={{ textAlign: "center" }}>
        Choose Your Subscription Plan
      </Title>
      <Paragraph style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
        Select the plan that best fits your needs. Upgrade anytime for more powerful features and access.
      </Paragraph>

      <Row gutter={24} justify="center" style={{ marginTop: "3rem" }}>
        <Col xs={24} sm={12} md={8}>
          <Card
            title="Basic Plan"
            bordered={false}
            style={{
              border: "2px solid #1890ff",
              borderRadius: "15px",
              background: "#e6f7ff",
              display: "flex",
              flexDirection: "column",
            }}
            headStyle={{ color: "#1890ff" }}
          >
            <Paragraph style={{ fontSize: '1.5em' }}>
              <Text strong style={{ fontSize: '1.5em' }}>₹ 0</Text> / Year - Basic users can only manage assets.
            </Paragraph>
            <Divider />
            <List
              id="basic-features-list"
              dataSource={basicFeatures}
              renderItem={(item) => (
                <List.Item>
                  {item.icon} <span style={{ marginLeft: 8 }}>{item.title}</span>
                </List.Item>
              )}
              style={{ flexGrow: 1, marginBottom: 16 }}
            />
            <Divider />
            <Button type="default" block onClick={handleBasicClick}>
              Continue with Basic
            </Button>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card
            title="Premium Plan"
            bordered={false}
            style={{
              border: "2px solid #1890ff",
              borderRadius: "15px",
              background: "#e6f7ff",
              display: "flex",
              flexDirection: "column",
            }}
            headStyle={{ color: "#1890ff" }}
          >
            <Paragraph style={{ fontSize: '1.5em' }}>
              <Text strong style={{ fontSize: '1.5em' }}>₹ 1499</Text> / Year - Full access for administrators.
            </Paragraph>
            <Divider />
            <List
              id="premium-features-list"
              dataSource={premiumFeatures}
              renderItem={(item) => (
                <List.Item>
                  {item.icon} <span style={{ marginLeft: 8 }}>{item.title}</span>
                </List.Item>
              )}
              style={{ flexGrow: 1, marginBottom: 16 }}
            />
            <Divider />
            <Button type="primary" block onClick={handlePremiumSubscribe} disabled={!userEmail}>
              Subscribe to Premium
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Subscription;

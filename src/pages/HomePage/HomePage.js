import React from "react";
import { Button, Typography } from "antd";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph } = Typography;

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="overlay">
        <div className="content">
          <Title level={1} className="home-title">
            Welcome to Asset Management System
          </Title>
          <Paragraph className="home-description">
            Efficiently manage your organization's assets, track assignments, and streamline operations with our modern solutions.
          </Paragraph>
          <Button
            type="primary"
            size="large"
            className="home-button"
            onClick={() => navigate("/login")}
            aria-label="Get Started and navigate to login"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
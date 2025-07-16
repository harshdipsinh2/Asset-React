import React, { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, message } from "antd";
import {UserOutlined, TeamOutlined, LaptopOutlined, CloudDownloadOutlined,
        IdcardOutlined, DesktopOutlined, CloudSyncOutlined 
       } from "@ant-design/icons";
import { fetchUserCount, fetchRoleCount, fetchEmployeeCount, fetchSoftwareAssetCount, fetchAssignedPhysicalAssetCount,
         fetchAssignedSoftwareAssetCount, fetchPhysicalAssetCount, getPhysicalAssets, fetchUserProfile  
       } from "../../services/dashboardService";

const Dashboard = () => {
  const [userCount, setUserCount] = useState(0);
  const [roleCount, setRoleCount] = useState(0);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [physicalAssets, setPhysicalAssets] = useState([]);
  const [physicalAssetCount, setPhysicalAssetCount] = useState(0);
  const [softwareAssetCount, setSoftwareAssetCount] = useState(0);
  const [assignedPhysicalAssetCount, setAssignedPhysicalAssetCount] = useState(0);
  const [assignedSoftwareAssetCount, setAssignedSoftwareAssetCount] = useState(0);
  const [roleID, setRoleID] = useState(null);
  const [isExpanded,setIsExpanded] = useState(false);

  const totalSoftwareCapacity = softwareAssetCount * employeeCount;
  const remainingSoftwareAssets = Math.max(totalSoftwareCapacity - assignedSoftwareAssetCount, 0);

  useEffect(() => {
    getPhysicalAssets().then(setPhysicalAssets).catch(() => {
      message.error("Failed to load physical assets.");
      setPhysicalAssets([]);
    });

    fetchUserCount(setUserCount);
    fetchRoleCount(setRoleCount);
    fetchEmployeeCount(setEmployeeCount);
    fetchSoftwareAssetCount(setSoftwareAssetCount);
    fetchAssignedSoftwareAssetCount(setAssignedSoftwareAssetCount);
    fetchPhysicalAssetCount(setPhysicalAssetCount);
    fetchAssignedPhysicalAssetCount(setAssignedPhysicalAssetCount);
    fetchUserProfile(() => {}, () => {}, setRoleID);
  }, []);

  const remainingPhysicalAssets = physicalAssets.reduce((total, asset) => total + (asset.quantity || 0), 0);
  const remainingByCategory = physicalAssets.reduce((acc, asset) => {
    const type = asset.type || "Unknown";
    acc[type] = (acc[type] || 0) + (asset.quantity || 0);
    return acc;
  }, {});

  const cardData = [
    { title: "Total Users", value: userCount, icon: <UserOutlined />, color: "#1890ff", roles: [1] },
    { title: "Total Roles", value: roleCount, icon: <TeamOutlined />, color: "#722ed1", roles: [1] },
    { title: "Total Employees", value: employeeCount, icon: <IdcardOutlined />, color: "#faad14", roles: [1, 2] },
    { title: "Total Types of Physical Assets", value: physicalAssetCount, icon: <LaptopOutlined />, color: "#13c2c2", roles: [1, 2, 3] },
    { title: "Total Types of Software Assets", value: softwareAssetCount, icon: <CloudDownloadOutlined />, color: "#52c41a", roles: [1, 2, 3] },
    { title: "Assigned Physical Assets", value: assignedPhysicalAssetCount, icon: <DesktopOutlined />, color: "#f5222d", roles: [1] },
    { title: "Assigned Software Assets", value: assignedSoftwareAssetCount, icon: <CloudSyncOutlined />, color: "#eb2f96", roles: [1] },
    { 
      title: "Remaining Physical Assets", 
      value: remainingPhysicalAssets, 
      icon: <LaptopOutlined />, 
      color: "#fa541c", 
      roles: [1],
      expandable: true // Mark this card as expandable
    },
    { title: "Remaining Software", value: remainingSoftwareAssets, icon: <CloudDownloadOutlined />, color: "#52c41a", roles: [1] }
  ];

  return (
    <div className="dashboard-container">
      <Row gutter={[24, 24]}>
        {cardData
          .filter(card => card.roles.includes(roleID))
          .map((card, index) => (
            <Col xs={24} sm={12} lg={8} key={index}>
              <Card
                className="dashboard-card"
                style={{ borderLeft: `5px solid ${card.color}`, cursor: card.expandable ? "pointer" : "default" }}
                hoverable={card.expandable}
                onClick={() => {
                  if (card.expandable) setIsExpanded(!isExpanded);
                }}
              >
                <Statistic
                  title={card.title}
                  value={card.value}
                  prefix={<span style={{ color: card.color }}>{card.icon}</span>}
                />
                {card.expandable && isExpanded && (
                  <div style={{ marginTop: "16px", paddingTop: "10px", borderTop: "1px solid #ddd" }}>
                    <h3 style={{ marginBottom: "8px" }}>Breakdown:</h3>
                    {Object.entries(remainingByCategory).map(([type, quantity]) => (
                      <p key={type} style={{ marginBottom: "5px" }}>
                        <b>{type}:</b> {quantity}
                      </p>
                    ))}
                  </div>
                )}
              </Card>
            </Col>
          ))}
      </Row>
    </div>
  );
};

export default Dashboard;
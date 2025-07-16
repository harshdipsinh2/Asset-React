import React, { useEffect, useState, useCallback } from "react";
import { Table, Button, Popconfirm, message, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { getUserRole } from "../../services/userService";
import { getSoftwareAssets, deleteSoftwareAsset } from "../../services/softwareAssetService";

const SoftwareAssetList = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const assetList = await getSoftwareAssets();
      setAssets(assetList);
    } catch (error) {
      message.error("Failed to fetch software assets.");
    }
    setLoading(false);
  }, []);
  
  useEffect(() => {
    const fetchInitialData = async () => {
      const role = await getUserRole();
      setUserRole(role);
      fetchAssets(); // Call fetchAssets
    };
    fetchInitialData();
  }, [fetchAssets]); // Include fetchAssets in the dependency array
  

  const handleDelete = async (softwareId) => {
    try {
      // Call the delete function, which already handles success/error messages
      await deleteSoftwareAsset(softwareId, fetchAssets);
    } catch (error) {
      // In case of error, the error message will already be shown by the delete function
      // You can handle any additional operations here if needed
    }
  };
  

  const handleUpdate = (softwareId) => {
    navigate(`/update-softwareasset/${softwareId}`);
  };

  const columns = [
    { title: "Software Name", dataIndex: "softwareName", key: "softwareName" },
    { title: "Subscription Cost", dataIndex: "subscriptionCost", key: "subscriptionCost" },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      key: "endDate",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    { title: "Vendor", dataIndex: "vendor", key: "vendor" },
    { title: "License Type", dataIndex: "licenseType", key: "licenseType" },
    { title: "Applications", dataIndex: "apps", key: "apps" },
  ];

  // Only show actions for Admin (2) and Super Admin (1)
  if (userRole === 1 || userRole === 2) {
    columns.push({
      title: "Actions",
      key: "actions",
      render: (record) => (
        <>
          <Button
            onClick={() => handleUpdate(record.softwareId)}
            type="primary"
            style={{ marginRight: 10 }}
          >
            Update
          </Button>
          {userRole === 1 && (
            <Popconfirm
              title="Are you sure you want to delete this software asset?"
              onConfirm={() => handleDelete(record.softwareId)}
              okText="Yes"
              cancelText="No"
            >
              <Button danger>Delete</Button>
            </Popconfirm>
          )}
        </>
      ),
    });
  }

  return (
    <>
        <Typography.Title
          level={2}
          style={{ textAlign: "left", marginBottom: userRole === 1 ? -35 : 0,}} >
          Software List
        </Typography.Title>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20}}>
        {userRole === 1 && (
          <Button type="primary" onClick={() => navigate("/insert-softwareasset")}>
            Add Software
          </Button>
        )}
      </div>

      <Table
        dataSource={assets}
        columns={columns}
        loading={loading}
        rowKey="softwareId"
        bordered
      />
    </>
  );
};

export default SoftwareAssetList;

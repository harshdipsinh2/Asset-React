import React, { useEffect, useState } from "react";
import { Table, Card, message, Spin, Button } from "antd";
import { getEmployeeAssignedAssets } from "../../services/employeePhysicalAssetService";
import { getPhysicalAssets } from "../../services/physicalAssetService";
import { fetchUserProfile } from "../../services/profileService";
import { createCheckoutSession } from "../../services/paymentService";

const ViewPhysicalAsset = () => {
  const [assignedAssets, setAssignedAssets] = useState([]);
  const [remainingAssets, setRemainingAssets] = useState([]);
  const [employeeId, setEmployeeID] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const data = await fetchUserProfile();
        if (data?.employeeID) {
          setEmployeeID(data.employeeID);
        } else {
        }
      } catch (error) {
        message.error("Failed to load profile data.");
      }
    };

    getProfile();
  }, []);

  useEffect(() => {
    if (!employeeId) return;
  
    const fetchAssets = async () => {
      try {
        const allAssets = await getPhysicalAssets();
        const response = await getEmployeeAssignedAssets(employeeId);
        const assigned = response.data || []; 
  
        // Create a map of assetId to asset type for quick lookup
        const assetTypeMap = {};
      allAssets.forEach((asset) => {
        assetTypeMap[asset.assetID] = asset.type;
      });

      // Combine assigned assets with type information
      const combinedAssets = assigned.map((assignedAsset) => ({
        ...assignedAsset,
        type: assetTypeMap[assignedAsset.assetId],
      }));

      setAssignedAssets(combinedAssets);
      setRemainingAssets(
        allAssets.filter((asset) =>
          !assigned.some((assignedAsset) => assignedAsset.assetId === asset.assetID)
        )
      );
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
  
    fetchAssets();
  }, [employeeId]);
  
  // Handle buying an asset
  const handleBuyAsset = async (assetID) => {
    if (!employeeId) {
      message.error("Employee ID is not available.");
      return;
    }
    try {
      // Corrected argument order: employeeID first, then assetID
      await createCheckoutSession(employeeId, assetID);
    } catch (error) {
    }
  };

  // Columns for My Assets (includes Assigned Date and Buy button)
  const assignedColumns = [
    { title: "Asset Name", dataIndex: "assetName", key: "assetName", width: 200 },
    { title: "Assigned Date", dataIndex: "assignedDate", key: "assignedDate", render: (date) => date ? date.split("T")[0] : "N/A", width: 200 },
    {
      title: "Action",
      key: "action",
      width: 150,
      render: (_, record) => {
        const buttonStyle = {
          padding: '4px 8px', // Consistent padding
          height: '35px', // Example consistent height
        };
  
        if (record.type === "Electronics") {
          return (
            <Button type="primary" style={buttonStyle} onClick={() => handleBuyAsset(record.assetId)}>
              Buy Asset
            </Button>
          );
        } else {
          return <div style={{...buttonStyle, visibility: 'hidden'}}></div>; // Placeholder
        }
      },
    },
  ];
  

  // Columns for Remaining Assets
  const remainingColumns = [
    { title: "Asset Name", dataIndex: "assetName", key: "assetName" },
  ];

  return (
    <Card title="Physical Assets" bordered={false} style={{ margin: 20 }}>
      {loading ? (
        <Spin size="large" style={{ display: "block", margin: "auto", padding: 20 }} />
      ) : (
        <>
          <Card title="My Physical Assets" bordered={false} style={{ marginBottom: 20 }}>
            <Table
              columns={assignedColumns}
              dataSource={assignedAssets}
              rowKey={(record) => record.assetId}
              pagination={{ pageSize: 5 }}
            />
          </Card>

          <Card title="Remaining Physical Assets" bordered={false}>
            <Table
              columns={remainingColumns}
              dataSource={remainingAssets}
              rowKey={(record) => record.assetID}
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </>
      )}
    </Card>
  );
};

export default ViewPhysicalAsset;

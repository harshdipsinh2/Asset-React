import React, { useEffect, useState, useCallback} from "react";
import { Table, Button, Popconfirm, message, Typography  } from "antd";
import { useNavigate } from "react-router-dom";
import { getUserRole } from "../../services/userService";
import { getPhysicalAssets, deletePhysicalAsset } from "../../services/physicalAssetService";

const PhysicalAssetList = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const assetList = await getPhysicalAssets();
      setAssets(assetList);
    } catch (error) {
      message.error("Failed to fetch physical assets.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      const role = await getUserRole();
      setUserRole(role);
      fetchAssets();
    };
    fetchInitialData();
  }, [fetchAssets]); 
  
  const handleDelete = async (assetId) => {
    try {
      await deletePhysicalAsset(assetId, fetchAssets);
    } catch (error) { }
  };
  
  const handleUpdate = (assetId) => {
    navigate(`/update-physicalasset/${assetId}`);
  };

  const columns = [
    { title: "Asset Name", dataIndex: "assetName", key: "assetName" },
    { title: "Type", dataIndex: "type", key: "type" },
    { title: "Description", dataIndex: "description", key: "description" },
    { title: "Purchase Cost", dataIndex: "purchaseCost", key: "purchaseCost" },
    {
      title: "Purchase Date",
      dataIndex: "purchaseDate",
      key: "purchaseDate",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    { title: "Department", dataIndex: "department", key: "department" },
    { title: "Location", dataIndex: "location", key: "location" },
    { title: "Status", dataIndex: "status", key: "status" },
    { title: "Condition", dataIndex: "condition", key: "condition" },
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
  ];

  // Only show actions for Admin (2) and Super Admin (1)
  if (userRole === 1 || userRole === 2) {
    columns.push({
      title: "Actions",
      key: "actions",
      render: (record) => (
        <>
          <Button
            onClick={() => handleUpdate(record.assetID)}
            type="primary"
            style={{ marginRight: 10 }}
          >
            Update
          </Button>
          {userRole === 1 && (
            <Popconfirm
              title="Are you sure you want to delete this asset?"
              onConfirm={() => handleDelete(record.assetID)}
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
          PhysicalAsset List
        </Typography.Title>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20}}>
        {userRole === 1 && (
          <Button type="primary" onClick={() => navigate("/insert-physicalasset")}>
            Add Physical Asset
          </Button>
        )}
      </div>

      <Table
        dataSource={assets}
        columns={columns}
        loading={loading}
        rowKey="assetID"
        bordered
      />
    </>
  );
};

export default PhysicalAssetList;
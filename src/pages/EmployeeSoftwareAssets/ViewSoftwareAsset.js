import React, { useEffect, useState } from "react";
import { Table, Card, message, Spin } from "antd";
import { getEmployeeAssignedSoftwareAssets } from "../../services/employeeSoftwareAssetService";
import { getSoftwareAssets } from "../../services/softwareAssetService";
import { fetchUserProfile } from "../../services/profileService";

const ViewSoftwareAsset = () => {
  const [assignedSoftware, setAssignedSoftware] = useState([]);
  const [remainingSoftware, setRemainingSoftware] = useState([]);
  const [employeeID, setEmployeeID] = useState(null);
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
        console.error("Error fetching profile data:", error);
        message.error("Failed to load profile data.");
      }
    };

    getProfile();
  }, []);

  useEffect(() => {
    if (!employeeID) return;

    const fetchAssets = async () => {
      try {
        const allSoftware = await getSoftwareAssets();
        const response = await getEmployeeAssignedSoftwareAssets(employeeID);
        const assigned = response.data || [];
    
        const assignedSoftwareIDs = new Set(assigned.map(asset => asset.softwareID));
    
        const remaining = allSoftware.filter(
          software => !assignedSoftwareIDs.has(software.softwareId)
        );
    
        setAssignedSoftware(assigned);
        setRemainingSoftware(remaining);
      } catch (error) {
        message.error("Failed to fetch software assets.");
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, [employeeID]);

  // Columns for Assigned Software Assets
  const assignedColumns = [
    { title: "Software Name", dataIndex: "softwareName", key: "softwareName" },
    { title: "Assigned Date", dataIndex: "assignedDate", key: "assignedDate", render: (date) => date ? date.split("T")[0] : "N/A" },
  ];

  // Columns for Remaining Software Assets
  const remainingColumns = [{ title: "Software Name", dataIndex: "softwareName", key: "softwareName" }];

  return (
    <Card title="Software" bordered={false} style={{ margin: 20 }}>
      {loading ? (
        <Spin size="large" style={{ display: "block", margin: "auto", padding: 20 }} />
      ) : (
        <>
          <Card title="My Software Assets" bordered={false} style={{ marginBottom: 20 }}>
            <Table
              columns={assignedColumns}
              dataSource={assignedSoftware}
              rowKey={(record) => record.softwareID}
              pagination={{ pageSize: 5 }}
            />
          </Card>

          <Card title="Remaining Software Assets" bordered={false}>
            <Table
              columns={remainingColumns}
              dataSource={remainingSoftware}
              rowKey={(record) => record.softwareId}
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </>
      )}
    </Card>
  );
};

export default ViewSoftwareAsset;

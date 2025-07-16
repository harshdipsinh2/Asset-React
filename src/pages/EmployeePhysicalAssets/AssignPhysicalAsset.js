import React, { useState, useEffect } from "react";
import { Select, Button, message, Table, Card, Popconfirm, Space, Typography, Spin, Input, Modal, DatePicker } from "antd";
import dayjs from "dayjs";
import { SearchOutlined } from "@ant-design/icons";
import { getEmployees, getPhysicalAssets, assignPhysicalAsset, getAssignedPhysicalAssets,
         unassignPhysicalAsset, transferPhysicalAsset,
       } from "../../services/employeePhysicalAssetService";

const { Title } = Typography;

const AssignPhysicalAsset = () => {
  const [employees, setEmployees] = useState([]);
  const [assets, setAssets] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [assignedAssets, setAssignedAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchEmployeeText, setSearchEmployeeText] = useState("");
  const [searchAssetText, setSearchAssetText] = useState("");
  const [isTransferModalVisible, setIsTransferModalVisible] = useState(false);
  const [transferAsset, setTransferAsset] = useState(null);
  const [, setAssigningAll] = useState(false);
  const [newEmployee, setNewEmployee] = useState(null);
  const [isEmployeeSearchModalVisible, setIsEmployeeSearchModalVisible] = useState(false);
  const [isAssetSearchModalVisible, setIsAssetSearchModalVisible] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const employeeData = await getEmployees();
      const assetData = await getPhysicalAssets();
      const assignedData = await getAssignedPhysicalAssets();
      setEmployees(Array.isArray(employeeData) ? employeeData : employeeData?.data || []);
      setAssets(Array.isArray(assetData) ? assetData : assetData?.data || []);
      setAssignedAssets(Array.isArray(assignedData) ? assignedData : assignedData?.data || []);
    } catch (error) {
     // message.error("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnassign = async (employeeId, assetId) => {
  try {
    await unassignPhysicalAsset(employeeId, assetId);
    message.success("Asset unassigned successfully.");
    fetchData();
  } catch (error) {
    message.error("Failed to unassign asset.");
  }
};


  const showTransferModal = (record) => {
    setTransferAsset(record);
    setIsTransferModalVisible(true);
  };

  const handleTransfer = async () => {
    if (!transferAsset || !newEmployee) {
      message.warning("Please select a new employee.");
      return;
    }

    try {
      await transferPhysicalAsset(transferAsset.employeeId, newEmployee, transferAsset.assetId);
      fetchData();
      setIsTransferModalVisible(false);
      setNewEmployee(null);
    } catch (error) {
      message.error("Failed to transfer asset.");
    }
  };

  const handleAssign = async () => {
    if (!selectedEmployee || selectedAssets.length === 0) {
      message.warning("Please select an employee and at least one asset.");
      return;
    }
    try {
      await assignPhysicalAsset(selectedEmployee, selectedAssets);
      fetchData();
      setSelectedAssets([]);
    } catch (error) {
    }
  };

  const handleAssignAllMissingAssets = async () => {
    if (!selectedEmployee) return;

    setAssigningAll(true);

    const assignedAssetIds = assignedAssets
      .filter((asset) => asset.employeeId === selectedEmployee)
      .map((asset) => asset.assetId);

    const missingAssets = assets.filter((asset) => !assignedAssetIds.includes(asset.assetID));

    if (missingAssets.length === 0) {
      message.info("No missing assets to assign.");
      setAssigningAll(false);
      return;
    }

    try {
      await assignPhysicalAsset(selectedEmployee, missingAssets.map((asset) => asset.assetID));
      message.destroy();
      message.success(`Assigned ${missingAssets.length} new physical asset(s).`);
      fetchData();
    } catch (error) {
    } finally {
      setAssigningAll(false);
    }
  };

  const handleUnassignAll = async (employeeId) => {
    const employeeAssets = assignedAssets.filter((asset) => asset.employeeId === employeeId);
    if (employeeAssets.length === 0) {
      message.info("No assets to unassign.");
      return;
    }

    try {
      await Promise.all(employeeAssets.map((asset) => unassignPhysicalAsset(employeeId, asset.assetId)));
      message.destroy();
      message.success("All missing assets unassigned successfully.");
      fetchData();
    } catch (error) {
      message.error("Failed to unassign assets.");
    }
  };

  const filteredData = assignedAssets.filter(
    (item) =>
      item.employeeName.toLowerCase().includes(searchEmployeeText.toLowerCase()) &&
      item.assetName.toLowerCase().includes(searchAssetText.toLowerCase())
  );

const columns = [
    {
      title: (
        <span>
          Employee{" "}
          <Button
            size="small"
            icon={<SearchOutlined />}
            style={{ marginLeft: 8 }}
            onClick={() => setIsEmployeeSearchModalVisible(true)}
          />
        </span>
      ),
      dataIndex: "employeeName",
      key: "employeeName",
    },
    {
      title: (
        <span>
          Physical Asset{" "}
          <Button
            size="small"
            icon={<SearchOutlined />}
            style={{ marginLeft: 8 }}
            onClick={() => setIsAssetSearchModalVisible(true)}
          />
        </span>
      ),
      dataIndex: "assetName",
      key: "assetName",
    },
    {
      title: <span>Assigned Date</span>,
      dataIndex: "assignedDate",
      key: "assignedDate",
      render: (date) => (date ? new Date(date).toLocaleDateString() : "N/A"),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <DatePicker
            onChange={(date, dateString) => setSelectedKeys(dateString ? [dateString] : [])}
            value={selectedKeys.length ? dayjs(selectedKeys[0]) : null}
            style={{ width: 180, marginBottom: 8, display: "block" }}
          />
          <Button
            type="primary"
            onClick={() => confirm()}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Search
          </Button>
          <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </div>
      ),
      onFilter: (value, record) => {
        return record.assignedDate ? record.assignedDate.startsWith(value) : false;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Are you sure you want to unassign asset?"
            onConfirm={() => handleUnassign(record.employeeId, record.assetId)}
            okText="Yes"
            cancelText="No"
            style={{ marginLeft: "8px" }}
          >
            <Button
              type="default"
              size="small"
              danger
              style={{ borderRadius: 4, height: 32 }}
            >
              Unassign
            </Button>
          </Popconfirm>

          <Popconfirm
            title="Are you sure you want to unassign all assets?"
            onConfirm={() => handleUnassignAll(record.employeeId)}
            okText="Yes"
            cancelText="No"
            style={{ marginLeft: "8px" }}
          >
          <Button
            type="default"
            size="small"
            danger
            style={{ borderRadius: 4, height: 32 }}
          >
            Unassign All
          </Button>           </Popconfirm>
          <Button
            type="primary"
            size="small"
            style={{ borderRadius: 4, height: 32 }}
            onClick={() => showTransferModal(record)}
          >
            Transfer
          </Button>
        </Space>
      ),
      width: 200,
    },
  ];
    

  return (
    <Card
    style={{
      width: "98%", // Broader card for better spacing
      maxWidth: "1100px", // Increased maxWidth for more space
      minWidth: "750px", // Prevents shrinking too small
      margin: "20px auto",
      padding: 15,
      borderRadius: 10,
      overflow: "hidden", // Ensures nothing leaks outside
    }}
  >
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: 20 }}>
      <Title level={3} style={{ textAlign: "center", marginBottom: 0 }}>
        Assign Assets
      </Title>
    </div>
  
    {loading ? (
      <Spin size="large" style={{ display: "block", textAlign: "center", margin: "20px 0" }} />
    ) : (
      <>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap", // Allows wrapping instead of overflow
            gap: "15px",
            marginBottom: "20px", // Adds space below buttons
            maxWidth: "100%", // Ensures it stays inside the Card
          }}
        >
          <Select
            placeholder="Select Employee"
            style={{ width: 220 }}
            value={selectedEmployee}
            onChange={setSelectedEmployee}
          >
            {employees.map((emp) => (
              <Select.Option key={emp.employeeId} value={emp.employeeId}>
                {emp.employeeName}
              </Select.Option>
            ))}
          </Select>
  
          <Select
            mode="multiple"
            placeholder="Select Assets"
            className="custom-select"
            style={{ width: 220 }}
            value={selectedAssets}
            onChange={setSelectedAssets}
          >
            {assets.map((asset) => (
              <Select.Option key={asset.assetID} value={asset.assetID}>
                {asset.assetName}
              </Select.Option>
            ))}
          </Select>
  
          <Button
            type="primary"
            onClick={handleAssign}
            disabled={!(selectedEmployee && selectedAssets.length > 0)}
            style={{ width: 100 }}
          >
            Assign
          </Button>
  
          <Button
            type="primary"
            onClick={handleAssignAllMissingAssets}
            disabled={!selectedEmployee}
            style={{
              width: 250,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis", // Handles overflow text
            }}
          >
            Assign All Missing Assets
          </Button>
        </div>
  
        <Title level={4} style={{ marginBottom: "20px" }}>Assigned Physical Assets</Title>

          <Table
            dataSource={filteredData}
            columns={columns}
            rowKey={(record) => `${record.employeeId}-${record.assetId}`}
            scroll={{ x: "max-content" }}
          />

          <Modal
            title="Transfer Asset"
            open={isTransferModalVisible}
            onOk={handleTransfer}
            onCancel={() => setIsTransferModalVisible(false)}
          >
            <p>
              Transfer asset <b>{transferAsset?.assetName}</b> from <b>{transferAsset?.employeeName}</b> to:
            </p>
            <Select
              placeholder="Select New Employee"
              style={{ width: "100%" }}
              value={newEmployee}
              onChange={setNewEmployee}
            >
              {employees.map((emp) => (
                <Select.Option key={emp.employeeId} value={emp.employeeId}>
                  {emp.employeeName}
                </Select.Option>
              ))}
            </Select>
          </Modal>

          <Modal
            title="Search Employee"
            open={isEmployeeSearchModalVisible}
            onCancel={() => setIsEmployeeSearchModalVisible(false)}
            footer={[
              <Button key="back" onClick={() => setIsEmployeeSearchModalVisible(false)}>
                Close
              </Button>,
            ]}
          >
            <Input
              placeholder="Search by Employee"
              prefix={<SearchOutlined />}
              value={searchEmployeeText}
              onChange={(e) => setSearchEmployeeText(e.target.value)}
              allowClear
            />
          </Modal>

          <Modal
            title="Search Asset"
            open={isAssetSearchModalVisible}
            onCancel={() => setIsAssetSearchModalVisible(false)}
            footer={[
              <Button key="back" onClick={() => setIsAssetSearchModalVisible(false)}>
                Close
              </Button>,
            ]}
          >
            <Input
              placeholder="Search by Asset"
              prefix={<SearchOutlined />}
              value={searchAssetText}
              onChange={(e) => setSearchAssetText(e.target.value)}
              allowClear
            />
          </Modal>
        </>
      )}
    </Card>
  );
};

export default AssignPhysicalAsset;
import React, { useEffect, useState } from "react";
import { Table, Button, Card, Tag, message, Tabs, Input, Row,  DatePicker, Modal, Popconfirm } from "antd";
import dayjs from "dayjs";
import { SearchOutlined } from "@ant-design/icons";
import { assignPhysicalAsset } from "../../services/employeePhysicalAssetService";
import { getPendingRequests, getRequestHistory, approveAssetRequest, rejectAssetRequest, getEmployees, getAssets,
       } from "../../services/requestApprovalService";

const { TabPane } = Tabs;

const RequestApproval = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [requestHistory, setRequestHistory] = useState([]);
  const [employees, setEmployees] = useState({});
  const [assetMap, setAssetMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchEmployee, setSearchEmployee] = useState("");
  const [searchAsset, setSearchAsset] = useState("");
  const [isEmployeeSearchModalVisible, setIsEmployeeSearchModalVisible] = useState(false);
  const [isAssetSearchModalVisible, setIsAssetSearchModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("1");

  useEffect(() => {
    fetchEmployees();
    fetchAssets();
    fetchRequests();
  }, []);

  // Fetch and Map Employees
  const fetchEmployees = async () => {
    try {
      const employeeData = await getEmployees();
      if (!Array.isArray(employeeData)) throw new Error("Invalid employee data format.");
      const employeeMap = {};
      employeeData.forEach((emp) => {
        employeeMap[emp.employeeId] = emp.employeeName;
      });
      setEmployees(employeeMap);
    } catch (error) {
    }
  };

  // Fetch and Map Assets
  const fetchAssets = async () => {
    try {
      const assetData = await getAssets();
      if (!Array.isArray(assetData)) throw new Error("Invalid asset data format.");
      const assetMapping = {};
      assetData.forEach((asset) => {
        if (asset.assetID) {
          assetMapping[asset.assetName] = asset.assetID;
        } else if (asset.softwareId) {
          assetMapping[asset.softwareName] = asset.softwareId;
        }
      });
      setAssetMap(assetMapping);
    } catch (error) {
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const pending = await getPendingRequests();
      const history = await getRequestHistory();
      if (!Array.isArray(pending) || !Array.isArray(history)) throw new Error("Invalid request data format.");
      setPendingRequests(pending);
      setRequestHistory(history);
    } catch (error) {
    }
    setLoading(false);
  };

  // Approve Request
  const handleApprove = async (requestID, assetName, employeeID) => {
    const assetID = assetMap[assetName] || null;
    if (!assetID) {
        message.error(`Asset ID not found for ${assetName}`);
        return;
    }
    try {
        await approveAssetRequest(requestID, assetID);
        await assignPhysicalAsset(employeeID, [assetID]); // Assign the asset
        message.destroy();
        message.success("Request approved and asset assigned successfully.");
        fetchRequests();
    } catch (error) {
        message.error("Failed to approve or assign the request.");
    }
};


  // Reject Request
  const handleReject = async (requestID, assetName) => {
    const assetID = assetMap[assetName] || null;
    if (!assetID) {
      message.error(`Asset ID not found for ${assetName}`);
      // console.error(`Asset ID not found for ${assetName}`);
      return;
    }
    try {
      await rejectAssetRequest(requestID, assetID);
      fetchRequests();
    } catch (error) {
      message.error("Failed to reject the request.");
    }
  };

  // Approve All Requests
  const handleApproveAll = async () => {
    if (pendingRequests.length === 0) {
        message.warning("No pending requests to approve.");
        return;
    }

    setLoading(true);
    try {
        await Promise.all(
            pendingRequests.map(async (request) => {
                const assetID = assetMap[request.assetName] || null;
                if (assetID) {
                    await approveAssetRequest(request.requestID, assetID);
                    await assignPhysicalAsset(request.employeeID, [assetID]); // Assign asset to each employee
                }
                return null;
            })
        );
        message.destroy();
        message.success("All requests approved and assets assigned successfully.");
        fetchRequests();
    } catch (error) {
        message.error("Failed to approve or assign all requests.");
    }
    setLoading(false);
};

  // Common Table Columns
  const commonColumns = [
    // {
    //   title: "Request ID",
    //   dataIndex: "requestID",
    //   key: "requestID",
    // },
    {
      title: (
        <span>
          Employee{" "}
          {activeTab !== "1" && (
            <Button
              size="small"
              icon={<SearchOutlined />}
              style={{ marginLeft: 8 }}
              onClick={() => setIsEmployeeSearchModalVisible(true)}
            />
          )}
        </span>
      ),
      dataIndex: "employeeID",
      key: "employeeID",
      render: (employeeID) => employees[employeeID] || "Unknown",
    },
    {
      title: (
        <span>
          Asset Name{" "}
          {activeTab !== "1" && (
            <Button
              size="small"
              icon={<SearchOutlined />}
              style={{ marginLeft: 8 }}
              onClick={() => setIsAssetSearchModalVisible(true)}
            />
          )}
        </span>
      ),
      dataIndex: "assetName",
      key: "assetName",
      render: (assetName) => assetName || "N/A",
    },
    {
      title: "Requested Date",
      dataIndex: "requestedDate",
      key: "requestedDate",
      render: (date) => (date ? new Date(date).toLocaleString() : "-"),
      filters: [],
      onFilter: (value, record) => record.requestedDate && record.requestedDate.startsWith(value),
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
          <Button onClick={clearFilters} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </div>
      ),
    },
  ];

  // Columns for Request History
  const historyColumns = [
    ...commonColumns,
    {
      title: "Approval Date",
      dataIndex: "approvalDate",
      key: "approvalDate",
      render: (date) => (date ? new Date(date).toLocaleString() : "-"),
      filters: [],
      onFilter: (value, record) => record.approvalDate && record.approvalDate.startsWith(value),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <DatePicker
            onChange={(dateString) => setSelectedKeys(dateString ? [dateString] : [])}
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
          <Button onClick={clearFilters} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Pending" ? "orange" : status === "Approved" ? "green" : "red"}>
          {status}
        </Tag>
      ),
    },
  ];

  // Columns for Pending Requests
  const pendingColumns = [
    ...commonColumns,
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: () => <Tag color="orange">Pending</Tag>,
  },
  {
      title: "Action",
      key: "action",
      render: (_, record) => (
          <>
              <Button
                  type="primary"
                  onClick={() => handleApprove(record.requestID, record.assetName, record.employeeID)} // added employeeId
                  style={{ marginRight: 8 }}
              >
                  Approve
              </Button>
              <Popconfirm
                  title="Are you sure you want to reject this request?"
                  onConfirm={() =>handleReject(record.requestID, record.assetName)}
                  okText="Yes"
                  cancelText="No"
                  style={{ marginLeft: "8px" }}
              >
              <Button danger >
                  Reject
              </Button>
              </Popconfirm>
          </>
      ),
  },
];

  // Filtered Request History
  const filteredHistory = requestHistory.filter(
    (record) =>
      employees[record.employeeID]?.toLowerCase().includes(searchEmployee.toLowerCase()) &&
      record.assetName?.toLowerCase().includes(searchAsset.toLowerCase())
  );

  return (
    <Card title="Asset Requests" style={{ maxWidth: 1000, margin: "auto", marginTop: 20 }}>
      <Tabs defaultActiveKey="1" onChange={(key) => setActiveTab(key)}>
        <TabPane tab="Pending Requests" key="1">
          <Row justify="end" style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              onClick={handleApproveAll}
              disabled={pendingRequests.length === 0}
            >
              Accept All
            </Button>
          </Row>
          <Table
            columns={pendingColumns}
            dataSource={pendingRequests}
            rowKey="requestID"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </TabPane>
        <TabPane tab="Request History" key="2">
          <Table columns={historyColumns} dataSource={filteredHistory} rowKey="requestID" loading={loading} />
        </TabPane>
      </Tabs>

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
          value={searchEmployee}
          onChange={(e) => setSearchEmployee(e.target.value)}
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
          value={searchAsset}
          onChange={(e) => setSearchAsset(e.target.value)}
          allowClear
        />
      </Modal>
    </Card>
  );
};

export default RequestApproval;
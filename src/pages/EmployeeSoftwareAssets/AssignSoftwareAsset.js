import React, { useState, useEffect } from "react";
import { Select, Button, message, Table, Card, Space, Typography, Spin, Input, DatePicker,Modal, Popconfirm } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { getEmployees, getSoftwareAssets, assignMultipleSoftwareAssets, getEmployeeSoftwareAssets, unassignSoftwareAsset,
       } from "../../services/employeeSoftwareAssetService";
import dayjs from "dayjs";

const { Title } = Typography;

const AssignSoftwareAsset = () => {
  const [employees, setEmployees] = useState([]);
  const [softwareAssets, setSoftwareAssets] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedSoftware, setSelectedSoftware] = useState([]);
  const [assignedSoftware, setAssignedSoftware] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employeeSearchText, setEmployeeSearchText] = useState("");
  const [softwareSearchText, setSoftwareSearchText] = useState("");
  const [isEmployeeSearchModalVisible, setIsEmployeeSearchModalVisible] = useState(false);
  const [isSoftwareSearchModalVisible, setIsSoftwareSearchModalVisible] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const employeeData = await getEmployees();
      const softwareData = await getSoftwareAssets();
      const assignedData = await getEmployeeSoftwareAssets();

      setEmployees(Array.isArray(employeeData) ? employeeData : employeeData?.data || []);
      setSoftwareAssets(Array.isArray(softwareData) ? softwareData : softwareData?.data || []);
      setAssignedSoftware(Array.isArray(assignedData) ? assignedData : assignedData?.data || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedEmployee || selectedSoftware.length === 0) {
      message.destroy();
      message.warning("Please select both an employee and at least one software asset.");
      return;
    }

    const alreadyAssignedIds = new Set(
      assignedSoftware
        .filter((item) => item.employeeId === selectedEmployee)
        .map((item) => item.softwareID)
    );

    const newAssignments = selectedSoftware.filter((softwareId) => !alreadyAssignedIds.has(softwareId));

    if (newAssignments.length === 0) {
      message.destroy();
      message.info("Employee already has these software assigned.");
      return;
    }

    try {
      await assignMultipleSoftwareAssets(selectedEmployee, newAssignments);
      message.destroy();
      message.success(`Assigned ${newAssignments.length} new software assets.`);
      fetchData();
      setSelectedSoftware([]);
    } catch (error) {
      message.error("Failed to assign software.");
    }
  };

  const handleUnassign = async (employeeId, softwareId) => {
    try {
      await unassignSoftwareAsset(employeeId, softwareId);
      // message.destroy();
      message.success("Software unassigned successfully.");
      fetchData();
    } catch (error) {
      message.error("Failed to unassign software.");
    }
  };

  const handleUnassignAll = async (employeeId) => {
    const employeeSoftware = assignedSoftware.filter((item) => item.employeeId === employeeId);



    try {
      await Promise.all(employeeSoftware.map((item) => unassignSoftwareAsset(employeeId, item.softwareID)));
      message.destroy();
      message.success("All software unassigned successfully.");
      fetchData();
    } catch (error) {
      message.error("Failed to unassign all software.");
    }
  };

  const handleAssignAllMissing = async () => {
    if (!selectedEmployee) {
      message.destroy();
      message.warning("Please select an employee.");
      return;
    }

    const assignedSoftwareIds = new Set(
      assignedSoftware.filter((item) => item.employeeId === selectedEmployee).map((item) => item.softwareID)
    );

    const missingSoftware = softwareAssets.filter((asset) => !assignedSoftwareIds.has(asset.softwareId));

    if (missingSoftware.length === 0) {
      message.destroy();
      message.info("Employee already has all software assets.");
      return;
    }

    try {
      await assignMultipleSoftwareAssets(selectedEmployee, missingSoftware.map((asset) => asset.softwareId));
      message.destroy();
      message.success(`Assigned ${missingSoftware.length} new software assets.`);
      fetchData();
    } catch (error) {
      message.error("Failed to assign software.");
    }
  };

  const filteredAssignedSoftware = assignedSoftware.filter(
    (item) =>
      item.employeeName.toLowerCase().includes(employeeSearchText.toLowerCase()) &&
      item.softwareName.toLowerCase().includes(softwareSearchText.toLowerCase())
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
          Software{" "}
          <Button
            size="small"
            icon={<SearchOutlined />}
            style={{ marginLeft: 8 }}
            onClick={() => setIsSoftwareSearchModalVisible(true)}
          />
        </span>
      ),
      dataIndex: "softwareName",
      key: "softwareName",
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
      title: "Actions",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Popconfirm
            title="Are you sure you want to unassign software?"
            onConfirm={() => handleUnassign(record.employeeId, record.softwareID)}
            okText="Yes"
            cancelText="No"
            style={{ marginLeft: "8px" }}
          >
          <Button type="default" danger >
            Unassign
          </Button>
          </Popconfirm>
          <Popconfirm
            title="Are you sure you want to unassign all software?"
            onConfirm={() => handleUnassignAll(record.employeeId)}
            okText="Yes"
            cancelText="No"
            style={{ marginLeft: "8px" }}
          >
          <Button type="default" danger >
            Unassign All
          </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
    style={{
      width: "98%",
      maxWidth: "1100px", // More space for content
      minWidth: "750px", // Prevents it from getting too small
      margin: "20px auto",
      padding: 15,
      borderRadius: 10,
      overflow: "hidden",
    }}
  >
    <Title level={3} style={{ textAlign: "center", marginBottom: 20 }}>
      Assign Software
    </Title>
  
    {loading ? (
      <Spin size="large" style={{ display: "block", textAlign: "center", margin: "20px 0" }} />
    ) : (
      <>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap", // Wraps items if needed
            gap: "15px",
            marginBottom: "20px",
            maxWidth: "100%",
          }}
        >
          <Select
            placeholder="Select Employee"
            style={{ width: 220 }}
            value={selectedEmployee || undefined}
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
            placeholder="Select Software"
            className="custom-select"
            style={{ width: 220 }}
            value={selectedSoftware}
            onChange={setSelectedSoftware}
            allowClear
          >
            {softwareAssets.map((asset) => (
              <Select.Option key={asset.softwareId} value={asset.softwareId}>
                {asset.softwareName}
              </Select.Option>
            ))}
          </Select>
  
          <Button
            type="primary"
            onClick={handleAssign}
            disabled={!(selectedEmployee && selectedSoftware.length > 0)}
            style={{ width: 100 }}
          >
            Assign
          </Button>
  
          <Button
            type="primary"
            onClick={handleAssignAllMissing}
            disabled={!selectedEmployee}
            style={{
              width: 250,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Assign All Missing Software
          </Button>
        </div>
  
        <Title level={4} style={{ marginBottom: "20px" }}>Assigned Software</Title>
  
            <Table dataSource={filteredAssignedSoftware} columns={columns} rowKey={(record) => `${record.employeeId}-${record.softwareID}`} />

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
                value={employeeSearchText}
                onChange={(e) => setEmployeeSearchText(e.target.value)}
                allowClear
              />
            </Modal>

            <Modal
              title="Search Software"
              open={isSoftwareSearchModalVisible}
              onCancel={() => setIsSoftwareSearchModalVisible(false)}
              footer={[
                <Button key="back" onClick={() => setIsSoftwareSearchModalVisible(false)}>
                  Close
                </Button>,
              ]}
            >
              <Input
                placeholder="Search by Software"
                prefix={<SearchOutlined />}
                value={softwareSearchText}
                onChange={(e) => setSoftwareSearchText(e.target.value)}
                allowClear
              />
            </Modal>
          </>
        )}
    </Card>
  );
};

export default AssignSoftwareAsset;
import React, { useEffect, useState } from "react";
import { Table, message, Button, Popconfirm, Modal, Input, Typography } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getUserRole } from "../../services/userService";
import { getEmployees, deleteEmployeeById, updateEmployeeEmail } from "../../services/employeeService";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [isEmailModalVisible, setIsEmailModalVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [newEmail, setNewEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialData = async () => {
      const role = await getUserRole();
      setUserRole(role);
      fetchEmployees();
    };
    fetchInitialData();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await getEmployees();
      const formattedEmployees = response.data.map((employee) => ({
        ...employee,
        joinDate: new Date(employee.joinDate).toLocaleDateString(),
      }));
      setEmployees(formattedEmployees);
    } catch (error) {
      message.error("Failed to fetch employees.");
    }
    setLoading(false);
  };

  const handleDelete = async (employeeId) => {
    try {
      const response = await deleteEmployeeById(employeeId);
      if (response) {
        fetchEmployees();
      } else {
        throw new Error("Failed to delete employee.");
      }
    } catch (error) {
      if (error.response?.status === 400) {
        message.error(error.response.data.message || "Cannot delete this employee.");
      } else {
      }
    }
  };

  const handleUpdate = (employeeId) => {
    navigate(`/update-employee/${employeeId}`);
  };

  // Open the email update modal
  const handleUpdateEmail = (record) => {
    setSelectedEmployee(record);
    setNewEmail(record.emailId);
    setIsEmailModalVisible(true);
  };

  // Submit the email update
  const submitEmailUpdate = async () => {
    if (!selectedEmployee) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newEmail || !emailRegex.test(newEmail)) {
      message.error("Invalid email address! Please enter a valid email.");
      return;
    }

    try {
      await updateEmployeeEmail(selectedEmployee.employeeId, newEmail);
      message.success("Employee email updated successfully!");

      // Update state immediately
      setEmployees((prevEmployees) =>
        prevEmployees.map((emp) =>
          emp.employeeId === selectedEmployee.employeeId
            ? { ...emp, emailId: newEmail }
            : emp
        )
      );

      setIsEmailModalVisible(false); // Close modal
    } catch (error) {
    }
  };

  const columns = [
    { title: "Employee ID", dataIndex: "employeeId", key: "employeeId" },
    { title: "Name", dataIndex: "employeeName", key: "employeeName" },
    { title: "Department", dataIndex: "dept", key: "dept" },
    { title: "Joining Date", dataIndex: "joinDate", key: "joinDate" },
    { title: "Role", dataIndex: "role", key: "role" },
    {
      title: "Email",
      dataIndex: "emailId",
      key: "emailId",
      render: (text, record) => (
        <span>
          {text}{" "}
          {(userRole === 1 || (userRole === 2 && record.roleID !== 1)) && (
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleUpdateEmail(record)} />
          )}
        </span>
      ),
    },
  ];

  if (userRole !== 3) {
    columns.push({ title: "Phone Number", dataIndex: "phoneNumber", key: "phoneNumber" });
  }

  if (userRole === 1 || userRole === 2) {
    columns.push(
      { title: "Salary", dataIndex: "salary", key: "salary" },
      {
        title: "Actions",
        key: "actions",
        render: (record) => {
          const isAdminEditingSuperAdmin = userRole === 2 && record.roleID === 1;

          return (
            <div style={{ minHeight: "22px", display: "flex", alignItems: "center", gap: "10px" }}>
              {!isAdminEditingSuperAdmin && (
                <Button onClick={() => handleUpdate(record.employeeId)} type="primary">
                  Update
                </Button>
              )}

              {/* Only Super Admin (1) can delete employees */}
              {userRole === 1 && (
                <Popconfirm
                  title="Are you sure you want to delete this employee?"
                  onConfirm={() => handleDelete(record.employeeId)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button danger>Delete</Button>
                </Popconfirm>
              )}
            </div>
          );
        },
      }
    );
  }

  return (
    <>
      <Typography.Title level={2} style={{ textAlign: "left", marginBottom: userRole === 1 ? -35 : 0 }}>
        Employee List
      </Typography.Title>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        {userRole === 1 && (
          <Button type="primary" onClick={() => navigate("/insert-employee")}>
            Add Employee
          </Button>
        )}
      </div>

      <Table dataSource={employees} columns={columns} loading={loading} rowKey="employeeId" bordered />

      {/* Email Update Modal */}
      <Modal title="Update Employee Email" open={isEmailModalVisible} onCancel={() => setIsEmailModalVisible(false)} onOk={submitEmailUpdate}>
        <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Enter new email" />
      </Modal>
    </>
  );
};

export default EmployeeList;

import React, { useEffect, useState } from "react";
import { Table, Tag, Button, Popconfirm, Typography, Form, Input, Modal, Select } from "antd";
import { getUserRole, getUsers, deleteUserByEmail, updateUserByEmail, addUser } from "../../services/userService";
import { fetchUserProfile } from "../../services/profileService";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [addForm] = Form.useForm();
  const [companyID, setCompanyID] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      const profile = await fetchUserProfile();
      setCompanyID(profile.companyID); // store companyID
    };
    loadProfile();
  }, []);

  useEffect(() => {
    fetchUserRole();
    fetchUsers();
  }, []);

  const fetchUserRole = async () => {
    const role = await getUserRole();
    setUserRole(role);
  };

  const fetchUsers = async () => {
    setLoading(true);
    const userList = await getUsers();
    setUsers(userList);
    setLoading(false);
  };

  const getRoleTag = (roleID) => {
    const roles = {
      1: { label: "Super Admin", color: "red" },
      2: { label: "Admin", color: "blue" },
      3: { label: "Employee", color: "green" },
    };
    return <Tag color={roles[roleID]?.color}>{roles[roleID]?.label}</Tag>;
  };

  const showUpdateModal = (record) => {
    setSelectedUser(record);
    form.setFieldsValue({
      username: record.username,
      email: record.email,
      phoneNumber: record.phoneNumber,
      roleID: record.roleID, // Initialize roleID in form
    });
    setIsUpdateModalVisible(true);
  };

  const handleUpdateCancel = () => {
    setIsUpdateModalVisible(false);
    setSelectedUser(null);
  };

  const handleUpdate = async (values) => {
    if (!selectedUser) return;
    const updatedUser = {
      username: values.username,
      email: values.email,
      phoneNumber: values.phoneNumber,
      password: "dummy_password", // Backend should handle password updates securely
      roleID: values.roleID,
    };
    await updateUserByEmail(selectedUser.email, updatedUser, () => {
      fetchUsers();
      handleUpdateCancel(); // Close modal after update
    });
  };

  const showAddModal = () => {
    setIsAddModalVisible(true);
    addForm.resetFields();
  };

  const handleAddCancel = () => {
    setIsAddModalVisible(false);
  };

  const handleAdd = async (values) => {
    const newUser = {
      username: values.addUsername,
      password: values.addPassword,
      employeeID: values.addEmployeeId,
      email: values.addEmail,
      phoneNumber: values.addPhoneNumber,
      roleID: values.addRoleID,
      companyID: companyID, // <-- add this line
    };
  
    await addUser(newUser, () => {
      fetchUsers();
      handleAddCancel(); // Close modal after add
    });
  };
  

  const columns = [
    { title: "Username", dataIndex: "username", key: "username" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Role",
      dataIndex: "roleID",
      key: "roleID",
      render: (roleID) => getRoleTag(roleID),
    },
    { title: "Role ID", dataIndex: "roleID", key: "roleID_number" },
    { title: "Employee ID", dataIndex: "employeeID", key: "employeeID" },
    userRole === 1 && {
      title: "Actions",
      key: "actions",
      render: (record) => (
        <>
          <Button type="primary" onClick={() => showUpdateModal(record)}>Update</Button>
          <Popconfirm
            title="Are you sure you want to delete this user?"
            onConfirm={() => deleteUserByEmail(record.email, fetchUsers)}
            okText="Yes"
            cancelText="No"
            style={{ marginLeft: "8px" }}
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        </>
      ),
    },
  ].filter(Boolean);

  return (
    <>
      <Typography.Title level={2} style={{ textAlign: "left", marginBottom: userRole === 1 ? -35 : 0 }}>
        Users
      </Typography.Title>
      {userRole === 1 && (
        <div style={{ marginBottom: 16, textAlign: "left", display: "flex", justifyContent: "flex-end" }}>
          <Button type="primary" onClick={showAddModal}>
            Add User
          </Button>
        </div>
      )}
      <Table dataSource={users} columns={columns} loading={loading} rowKey="userID" bordered />

      {/* Update User Modal */}
      <Modal
        title="Update User"
        open={isUpdateModalVisible}
        onCancel={handleUpdateCancel}
        onOk={form.submit}
      >
        <Form
          form={form}
          onFinish={handleUpdate}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          layout="horizontal"
        >
          <Form.Item label="Username" name="username">
            <Input />
          </Form.Item>
          <Form.Item label="Email" name="email">
            <Input />
          </Form.Item>
          <Form.Item label="Phone" name="phoneNumber">
            <Input />
          </Form.Item>
          <Form.Item label="Role" name="roleID">
            <Select>
              <Select.Option value={1}>Super Admin</Select.Option>
              <Select.Option value={2}>Admin</Select.Option>
              <Select.Option value={3}>Employee</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add User Modal */}
      <Modal
        title="Add New User"
        open={isAddModalVisible}
        onCancel={handleAddCancel}
        onOk={addForm.submit}
      >
 <Form
          form={addForm}
          onFinish={handleAdd}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          layout="horizontal"
        >
          <Form.Item
            label="Username"
            name="addUsername"
            rules={[{ required: true, message: "Please input the username!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Password"
            name="addPassword"
            rules={[{ required: true, message: "Please input the password!" }]}
          >
            <Input.Password />
          </Form.Item>
          {/* Add this Form.Item for EmployeeID */}
          <Form.Item
            label="EmployeeID"
            name="addEmployeeId"
            rules={[{ required: false, message: "Please input the Employee ID!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="addEmail"
            rules={[{ required: true, message: "Please input the email!", type: "email" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Phone" name="addPhoneNumber">
            <Input />
          </Form.Item>
          <Form.Item label="Role" name="addRoleID" initialValue={3}>
            <Select>
              <Select.Option value={1}>Super Admin</Select.Option>
              <Select.Option value={2}>Admin</Select.Option>
              <Select.Option value={3}>Employee</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default UserList;
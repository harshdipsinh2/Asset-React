import React, { useEffect, useState } from "react";
import { Table, message, Button, Popconfirm, Input, Typography } from "antd";
import { getRoles, getUserRole, addRole, deleteRole } from "../../services/roleService";

const RoleList = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [newRoleID, setNewRoleID] = useState("");
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");

  useEffect(() => {
    fetchRoles();
    fetchUserRole();
  }, []);

  const fetchRoles = async () => {
    try {
      const data = await getRoles();
      setRoles(data);
    } catch (error) {
      message.error("Failed to fetch roles.");
    }
    setLoading(false);
  };

  const fetchUserRole = async () => {
    try {
      const roleID = await getUserRole();
      setUserRole(roleID);
    } catch (error) {
      message.error("Failed to fetch user role.");
    }
  };

  const handleDelete = async (roleId) => {
    try {
      await deleteRole(roleId);
      message.success("Role deleted successfully.");
      fetchRoles();
    } catch (error) {
      message.error("Failed to delete role.");
    }
  };

  const handleAddRole = async () => {
    if (!newRoleID || !newRoleName || !newRoleDescription) {
      message.error("All fields are required.");
      return;
    }

    try {
      await addRole({ roleID: newRoleID, roleName: newRoleName, roleDescription: newRoleDescription });
      message.success("Role added successfully.");
      setNewRoleID(null);
      setNewRoleName("");
      setNewRoleDescription("");
      fetchRoles();
    } catch (error) {
      message.error("Failed to add role.");
    }
  };

  const columns = [
    { title: "Role Name", dataIndex: "roleName", key: "roleName" },
    { title: "Role Description", dataIndex: "roleDescription", key: "roleDescription" },
    ...(userRole === 1
      ? [
          {
            title: "Actions",
            key: "actions",
            render: (record) => (
              <Popconfirm
                title="Are you sure you want to delete this role?"
                onConfirm={() => handleDelete(record.roleID)}
                okText="Yes"
                cancelText="No"
              >
                <Button danger>Delete</Button>
              </Popconfirm>
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      <Typography.Title level={2} style={{ textAlign: "left"}}>
        Role Management
      </Typography.Title>

      {userRole === 1 && (
        <div style={{ marginBottom: 20, marginTop: 20 }}>
          <Input
            placeholder="Enter Role ID"
            value={newRoleID}
            onChange={(e) => setNewRoleID(e.target.value)}
            style={{ width: "200px", marginRight: "10px" }}
          />
          <Input
            placeholder="Enter new role name"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            style={{ width: "200px", marginRight: "10px" }}
          />
          <Input
            placeholder="Enter role description"
            value={newRoleDescription}
            onChange={(e) => setNewRoleDescription(e.target.value)}
            style={{ width: "200px", marginRight: "10px" }}
          />
          <Button type="primary" onClick={handleAddRole}>
            Add Role
          </Button>
        </div>
      )}

      <Table
        dataSource={roles}
        columns={columns}
        loading={loading}
        rowKey="roleID"
        bordered
      />
    </>
  );
};

export default RoleList;

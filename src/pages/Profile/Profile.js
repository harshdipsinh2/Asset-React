import React, { useEffect, useState } from "react";
import { Card, Descriptions, Button, Modal, Form, Input, message } from "antd"; // Import message
import { fetchUserProfile, getRoleTag } from "../../services/profileService";
import { updateUserByEmail } from "../../services/userService";
import { useNavigate } from "react-router-dom";
import { handleLogout } from "../../services/dashboardService";

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const getProfile = async () => {
      const data = await fetchUserProfile();
      if (data) {
        setProfile(data);
      }
    };
    getProfile();
  }, []);

  if (!profile) {
    return <p>Loading...</p>;
  }

  const showModal = () => {
    form.setFieldsValue({
      username: profile.username,
      email: profile.email,
      phoneNumber: profile.phoneNumber,
    });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleUpdate = async (values) => {
    if (!profile) return;
    
    const isUsernameChanged = values.username !== profile.username;
  
    const updatedUser = {
      employeeID: profile.employeeID, 
      username: values.username,
      password: "dummy_password",  // Password does not actually change
      roleID: profile.roleID,
      email: values.email,
      phoneNumber: values.phoneNumber,
    };
  
    const success = await updateUserByEmail(profile.email, updatedUser, async () => {
      setIsModalVisible(false);
  
      if (isUsernameChanged) {
        message.warning("Username changed. Please log in again.");
        setTimeout(() => handleLogout(), 2000); // Delay logout for user to see the message
      } else {
        fetchUserProfile().then((data) => setProfile(data));
      }
    });
  
    if (success) {
    }
  };
  
  
  

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <Button type="primary" onClick={() => navigate(-1)}>Go Back</Button>
        <Button type="primary" onClick={showModal}>Update Profile</Button>
      </div>
      <Card title="User Profile" style={{ width: 700, margin: "auto", marginTop: 50 }}>
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Username">{profile.username}</Descriptions.Item>
          <Descriptions.Item label="Employee ID">{profile.employeeID}</Descriptions.Item>
          <Descriptions.Item label="Email">{profile.email}</Descriptions.Item>
          <Descriptions.Item label="Phone Number">{profile.phoneNumber}</Descriptions.Item>
          <Descriptions.Item label="Role">
            <span style={{ display: "inline-block", minWidth: 120 }}>
              {getRoleTag(profile.roleID)}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Role ID">{profile.roleID}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Modal title="Update Profile" visible={isModalVisible} onCancel={handleCancel} footer={null}>
        <Form form={form} onFinish={handleUpdate} labelCol={{span: 6}} wrapperCol = {{span: 16}} layout= "horizontal">
          <Form.Item label="Username" name="username" rules={[{ required: true, message: "Please enter your username!" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Email" name="email" rules={[{ required: true, message: "Please enter your email!" }, { type: "email", message: "The input is not valid E-mail!" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Phone" name="phoneNumber" rules={[{ required: true, message: "Please enter your phone number!" }]}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Update
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Profile;
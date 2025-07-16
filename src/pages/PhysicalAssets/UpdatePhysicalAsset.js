import React, { useEffect, useState } from "react";
import { Form, Input, Button, Select, DatePicker, Card } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { getPhysicalAssetById, updatePhysicalAsset } from "../../services/physicalAssetService";
import { fetchUserProfile } from "../../services/profileService";

const { Option } = Select;

const UpdatePhysicalAsset = () => {
  const { assetId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const response = await getPhysicalAssetById(assetId);
        if (response && response.data) {
          const assetData = response.data;

          form.setFieldsValue({
            assetID: assetData.assetID,
            assetName: assetData.assetName,
            type: assetData.type,
            description: assetData.description,
            purchaseCost: assetData.purchaseCost,
            purchaseDate: assetData.purchaseDate ? dayjs(assetData.purchaseDate) : null,
            department: assetData.department,
            location: assetData.location,
            status: assetData.status,
            condition: assetData.condition,
            quantity: assetData.quantity,
          });
        }
      } catch (error) {
        console.error("Failed to fetch asset details:", error);
      }
    };

    fetchAsset();
  }, [assetId, form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Fetch the user profile to get the companyID
      const userProfile = await fetchUserProfile();
      if (!userProfile) {
        setLoading(false);
        console.error("Failed to fetch user profile.");
        return;
      }
  
      const payload = {
        assetID: assetId,
        assetName: values.assetName, 
        type: values.type,
        description: values.description,
        purchaseCost: values.purchaseCost,
        purchaseDate: values.purchaseDate ? values.purchaseDate.format("YYYY-MM-DD") : null, 
        department: values.department,
        location: values.location,
        status: values.status,
        condition: values.condition,
        quantity: values.quantity,
        companyID: userProfile.companyID, // Add companyID from the user profile
      };
  
      await updatePhysicalAsset(assetId, payload);
      navigate("/physicalasset-list");
    } catch (error) {
      console.error("Failed to update asset:", error);
    }
    setLoading(false);
  };
  

  return (
    <div style={{ maxWidth: "500px", margin: "auto", padding: "20px", background: "#fff", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}>
    <Card title="Update Physical Asset" className="update-card">
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Asset Name"
          name="assetName"
          rules={[{ required: true, message: "Please enter asset name!" }]}
        >
          <Input placeholder="Enter asset name" />
        </Form.Item>

        <Form.Item
          label="Type"
          name="type"
          rules={[{ required: true, message: "Please enter category!" }]}
        >
          <Input placeholder="Enter category" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: "Please enter description!" }]}
        >
          <Input.TextArea placeholder="Enter description" />
        </Form.Item>

        <Form.Item
          label="Purchase Cost"
          name="purchaseCost"
          rules={[{ required: true, message: "Please enter purchase cost!" }]}
        >
          <Input type="number" placeholder="Enter purchase cost" />
        </Form.Item>

        <Form.Item
          label="Purchase Date"
          name="purchaseDate"
          rules={[{ required: true, message: "Please select purchase date!" }]}
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Department"
          name="department"
          rules={[{ required: true, message: "Please enter department!" }]}
        >
          <Input placeholder="Enter department" />
        </Form.Item>

        <Form.Item
          label="Location"
          name="location"
          rules={[{ required: true, message: "Please enter location!" }]}
        >
          <Input placeholder="Enter location" />
        </Form.Item>

        <Form.Item
          label="Status"
          name="status"
          rules={[{ required: true, message: "Please select status!" }]}
        >
          <Select placeholder="Select status">
            <Option value="Available">Available</Option>
            <Option value="In Use">In Use</Option>
            <Option value="Damaged">Damaged</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Condition"
          name="condition"
          rules={[{ required: true, message: "Please select condition!" }]}
        >
          <Select placeholder="Select condition">
            <Option value="New">New</Option>
            <Option value="Good">Good</Option>
            <Option value="Needs Repair">Needs Repair</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Quantity"
          name="quantity"
          rules={[{ required: true, message: "Please enter quantity!" }]}
        >
          <Input type="number" placeholder="Enter quantity" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Update Asset
          </Button>
          <Button onClick={() => navigate("/physicalasset-list")} style={{ marginLeft: 10 }}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Card>
    </div>
  );
};

export default UpdatePhysicalAsset;

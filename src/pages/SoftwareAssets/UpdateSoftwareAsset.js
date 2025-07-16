import React, { useEffect, useState, useCallback } from "react";
import { Form, Input, Button, InputNumber, DatePicker, Card } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { getSoftwareAssetById, updateSoftwareAsset } from "../../services/softwareAssetService";
import { fetchUserProfile } from "../../services/profileService";
import dayjs from "dayjs";

const UpdateSoftwareAsset = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  //  Memoize fetchSoftwareAsset so it doesn’t trigger unnecessary re-renders
  const fetchSoftwareAsset = useCallback(async () => {
    const asset = await getSoftwareAssetById(id);
    if (asset) {
      form.setFieldsValue({
        ...asset,
        startDate: dayjs(asset.startDate),
        endDate: dayjs(asset.endDate),
      });
    }
  }, [id, form]); 

  useEffect(() => {
    fetchSoftwareAsset();
  }, [fetchSoftwareAsset]); 

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
  
      const formattedValues = {
        ...values,
        softwareId: id,
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.endDate.format("YYYY-MM-DD"),
        companyID: userProfile.companyID,  // Add companyID from the user profile
      };
  
      const success = await updateSoftwareAsset(id, formattedValues);
      setLoading(false);
  
      if (success) {
        navigate("/softwareasset-list");
      }
    } catch (error) {
      console.error("Failed to update software asset:", error);
      setLoading(false);
    }
  };
  
  return (
    <div style={{ maxWidth: "500px", margin: "auto", padding: "20px", background: "#fff", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}>
      <Card title="Update Software" className="update-card">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item label="Software Name" name="softwareName" rules={[{ required: true, message: "Please enter software name!" }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Subscription Cost" name="subscriptionCost" rules={[{ required: true, message: "Please enter subscription cost!" }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Start Date" name="startDate" rules={[{ required: true, message: "Please select start date!" }]}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="End Date" name="endDate" rules={[{ required: true, message: "Please select end date!" }]}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Vendor" name="vendor" rules={[{ required: true, message: "Please enter vendor name!" }]}>
            <Input />
          </Form.Item>

          <Form.Item label="License Type" name="licenseType" rules={[{ required: true, message: "Please enter license type!" }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Applications" name="apps">
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Update Software
            </Button>
            <Button onClick={() => navigate("/softwareasset-list")} style={{ marginLeft: 10 }}>
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default UpdateSoftwareAsset;

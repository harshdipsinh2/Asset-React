import React, { useState, useEffect } from "react";
import { Form, Select, Button, Card, message } from "antd";
import { requestAsset } from "../../services/requestService";
import { getEmployeeAssignedAssets } from "../../services/employeePhysicalAssetService";
import { getPhysicalAssets } from "../../services/physicalAssetService";
import { fetchUserProfile } from "../../services/profileService";
import dayjs from "dayjs";

const { Option } = Select;

const RequestAsset = () => {
  const [assets, setAssets] = useState([]);
  const [remainingAssets, setRemainingAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [employeeID, setEmployeeID] = useState(null);
  const [assignedAssetIDs, setAssignedAssetIDs] = useState(new Set());

  useEffect(() => {
    const getProfile = async () => {
      try {
        const data = await fetchUserProfile();
        if (data?.employeeID) {
          setEmployeeID(data.employeeID);
        } else {
        }
      } catch (error) {
        message.error("Failed to load profile data.");
      }
    };
    getProfile();
  }, []);

  useEffect(() => {
    if (!employeeID) return;

    const fetchAssets = async () => {
      try {
        const allAssets = await getPhysicalAssets();
        console.log("All Assets:", allAssets); // <-- Add this
        const response = await getEmployeeAssignedAssets(employeeID);
        const assigned = response.data || [];
        console.log("Assigned Assets:", assigned);
        const assignedIDs = new Set(assigned.map((asset) => asset.assetId));
        setAssignedAssetIDs(assignedIDs);

        const remaining = allAssets.filter((asset) => !assignedIDs.has(asset.assetID));
        setAssets(allAssets);
        setRemainingAssets(remaining);
      } catch (error) {
        console.error("Error fetching assets:", error); // <-- Log the error
        message.error("Error loading assets");
      } finally {
        setLoading(false);
      }
    };
    

    fetchAssets();
  }, [employeeID]);

  const handleRequestMissingAssets = async () => {
    if (remainingAssets.length === 0) {
      message.error("No missing assets to request.");
      return;
    }

    setLoading(true);

    try {
      const requestData = remainingAssets.map((asset) => ({
        employeeID,
        category: "Physical",
        assetID: asset.assetID,
        assetName: asset.assetName,
        status: "Pending",
        requestedDate: dayjs().format("YYYY-MM-DD"),
      }));

      for (const assetRequest of requestData) {
        await requestAsset(assetRequest);
      }
      message.destroy();
      message.success("Requested all missing assets successfully!");
    } catch (error) {
      console.error("Error requesting missing assets:", error);
      message.error("Failed to request missing assets.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);

    const requests = values.assetNames.map(assetName => {
      const selectedAsset = assets.find(
        (asset) => asset.assetName === assetName
      );      

        if (selectedAsset && assignedAssetIDs.has(selectedAsset.assetID)) {
            message.error(`You already have ${assetName} assigned to you.`);
            return null;
        }

        return {
            employeeID: employeeID,
            category: "Physical",
            assetID: selectedAsset?.assetID || null,
            assetName: assetName,
            status: "Pending",
            requestedDate: dayjs().format("YYYY-MM-DD"),
        };
    }).filter(request => request !== null);

    if (requests.length === 0) {
        setLoading(false);
        return;
    }

    try {
        for (const requestData of requests) {
            await requestAsset(requestData);
        }
        form.resetFields();
    } catch (error) {
        console.error("Error requesting asset:", error);
        message.error("Failed to request assets.");
    }

    setLoading(false);
  };

  return (
    <Card title="Request Asset" bordered={false} style={{ maxWidth: 600, margin: "auto", marginTop: 20 }}>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="assetNames" label="Select Assets" rules={[{ required: true, message: "Please select assets" }]}>
        <Select mode="multiple" placeholder="Select Assets" className="custom-select">
          {assets.length > 0 ? (
            assets.map((asset) => (
              <Option
                key={asset.assetID}
                value={asset.assetName}
                disabled={assignedAssetIDs.has(asset.assetID)} // ✅ Disable if already assigned
              >
                {asset.assetName} {assignedAssetIDs.has(asset.assetID) ? " (Already Assigned)" : ""}
              </Option>
            ))
          ) : (
            <Option disabled value="">
              No assets available
            </Option>
          )}
        </Select>

        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Request Assets
          </Button>
        </Form.Item>
      </Form>

      <Button
        type="primary"
        loading={loading}
        onClick={handleRequestMissingAssets}
        block
        disabled={remainingAssets.length === 0}
        style={{ marginTop: 10 }}
      >
        Request All Missing Assets
      </Button>
    </Card>
  );
};

export default RequestAsset;
import React, { useState, useEffect } from "react";
import { Form, Input, Button, DatePicker, Card, InputNumber, Select } from "antd";
import { useNavigate } from "react-router-dom";
import { addSoftwareAsset } from "../../services/softwareAssetService";
import { fetchUserProfile } from "../../services/profileService";

const { Option } = Select;

const InsertSoftwareAsset = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  // const [nextSoftwareId, setNextSoftwareId] = useState(null);
  const navigate = useNavigate();

  // Dropdown states
  const [vendorOptions, setVendorOptions] = useState(() => {
    return JSON.parse(localStorage.getItem("vendorOptions")) || [];
  });
  const [newVendor, setNewVendor] = useState("");

  const [licenseTypeOptions, setLicenseTypeOptions] = useState(() => {
    return JSON.parse(localStorage.getItem("licenseTypeOptions")) || [];
  });
  const [newLicenseType, setNewLicenseType] = useState("");

  useEffect(() => {
    localStorage.setItem("vendorOptions", JSON.stringify(vendorOptions));
  }, [vendorOptions]);

  useEffect(() => {
    localStorage.setItem(
      "licenseTypeOptions",
      JSON.stringify(licenseTypeOptions)
    );
  }, [licenseTypeOptions]);

  useEffect(() => {
    const fetchSoftwareAssets = async () => {
  //     try {
  //       const response = await getSoftwareAssets();
  //       if (Array.isArray(response) && response.length > 0) {
  //         const lastSoftwareId = Math.max(
  //           ...response.map((s) => Number(s.softwareId) || 0)
  //         );
  //         setNextSoftwareId(lastSoftwareId + 1);
  //       } else {
  //         setNextSoftwareId(101);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching software assets:", error);
  //       setNextSoftwareId(101);
  //     }
    };

    fetchSoftwareAssets();
  }, []);

  const handleAddOption = (value, options, setOptions, setNewValue, storageKey) => {
    if (value && !options.includes(value)) {
      const updatedOptions = [...options, value];
      setOptions(updatedOptions);
      localStorage.setItem(storageKey, JSON.stringify(updatedOptions));
    }
    setNewValue("");
  };

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
  
      const softwareAssetData = {
        softwareId: values.softwareId,
        softwareName: values.softwareName,
        subscriptionCost: values.subscriptionCost,
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.endDate.format("YYYY-MM-DD"),
        vendor: values.vendor,
        licenseType: values.licenseType,
        apps: values.apps,
        companyID: userProfile.companyID, // Add companyID from the user profile
      };
  
      await addSoftwareAsset(softwareAssetData);  // Call the function to add the software asset
      navigate("/softwareasset-list");
    } catch (error) {
      console.error("Failed to add software asset:", error);
    }
    setLoading(false);
  };
  

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "auto",
        padding: "20px",
        background: "#fff",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Card title="Insert Software Asset">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          {/* <Form.Item
            name="softwareId"
            label="Software ID"
            rules={[{  message: "Please enter software ID!" }]}
          >
            <Input placeholder="Enter software ID" />
          </Form.Item> */}

          <Form.Item
            label="Software Name"
            name="softwareName"
            rules={[
              { required: true, message: "Please enter software name!" },
            ]}
          >
            <Input placeholder="Enter software name" />
          </Form.Item>

          <Form.Item
            label="Subscription Cost"
            name="subscriptionCost"
            rules={[
              { required: true, message: "Please enter subscription cost!" },
            ]}
          >
            <InputNumber min={0} style={{ width: "100%" }} placeholder="Enter cost" />
          </Form.Item>

          <Form.Item
            label="Start Date"
            name="startDate"
            rules={[
              { required: true, message: "Please select start date!" },
            ]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="End Date"
            name="endDate"
            rules={[{ required: true, message: "Please select end date!" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          {/* Vendor Dropdown */}
          <Form.Item
            label="Vendor"
            name="vendor"
            rules={[
              { required: true, message: "Please select a vendor!" },
            ]}
          >
            <Select
              placeholder="Select or Enter vendor"
              onSearch={(value) => setNewVendor(value)}
              onChange={(value) =>
                handleAddOption(
                  value,
                  vendorOptions,
                  setVendorOptions,
                  setNewVendor,
                  "vendorOptions"
                )
              }
              dropdownRender={(menu) => (
                <>
                  {menu}
                  {newVendor && !vendorOptions.includes(newVendor) && (
                    <div
                      style={{
                        padding: "5px",
                        cursor: "pointer",
                        color: "blue",
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() =>
                        handleAddOption(
                          newVendor,
                          vendorOptions,
                          setVendorOptions,
                          setNewVendor,
                          "vendorOptions"
                        )
                      }
                    >
                      Add "{newVendor}"
                    </div>
                  )}
                </>
              )}
              showSearch
            >
              {vendorOptions.map((vendor) => (
                <Option key={vendor} value={vendor}>
                  {vendor}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* License Type Dropdown */}
          <Form.Item
            label="License Type"
            name="licenseType"
            rules={[
              { required: true, message: "Please select a license type!" },
            ]}
          >
            <Select
              placeholder="Select or Enter license type"
              onSearch={(value) => setNewLicenseType(value)}
              onChange={(value) =>
                handleAddOption(
                  value,
                  licenseTypeOptions,
                  setLicenseTypeOptions,
                  setNewLicenseType,
                  "licenseTypeOptions"
                )
              }
              dropdownRender={(menu) => (
                <>
                  {menu}
                  {newLicenseType && !licenseTypeOptions.includes(newLicenseType) && (
                    <div
                      style={{
                        padding: "5px",
                        cursor: "pointer",
                        color: "blue",
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() =>
                        handleAddOption(
                          newLicenseType,
                          licenseTypeOptions,
                          setLicenseTypeOptions,
                          setNewLicenseType,
                          "licenseTypeOptions"
                        )
                      }
                    >
                      Add "{newLicenseType}"
                    </div>
                  )}
                </>
              )}
              showSearch
            >
              {licenseTypeOptions.map((license) => (
                <Option key={license} value={license}>
                  {license}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Apps"
            name="apps"
            rules={[{ required: true, message: "Please enter apps!" }]}
          >
            <Input placeholder="Enter apps (comma separated)" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
            >
              Add Software Asset
            </Button>
            <Button
              onClick={() => navigate("/softwareasset-list")}
              style={{ marginLeft: 10 }}
            >
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default InsertSoftwareAsset;
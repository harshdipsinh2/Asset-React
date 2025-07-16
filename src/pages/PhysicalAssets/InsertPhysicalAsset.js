import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, DatePicker, Card, InputNumber } from "antd";
import { useNavigate } from "react-router-dom";
import { addPhysicalAsset } from "../../services/physicalAssetService";
import { fetchUserProfile } from "../../services/profileService";

const { Option } = Select;

const InsertPhysicalAsset = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  // const [nextAssetID, setNextAssetID] = useState(null);
  const navigate = useNavigate();
  const [newType, setNewType] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newDepartment, setNewDepartment] = useState("");
  const [newDescription, setNewDescription] = useState("");


  // Load options from localStorage or set default values
  const [statusOptions, setStatusOptions] = useState(() => {
    return JSON.parse(localStorage.getItem("statusOptions")) || ["Available", "In Use", "Damaged"];
  });

  const [conditionOptions, setConditionOptions] = useState(() => {
    return JSON.parse(localStorage.getItem("conditionOptions")) || ["New", "Good", "Needs Repair"];
  });

  const [locationOptions, setLocationOptions] = useState(() => {
    return JSON.parse(localStorage.getItem("locationOptions")) || [];
  });
  
  const [departmentOptions, setDepartmentOptions] = useState(() => {
    return JSON.parse(localStorage.getItem("departmentOptions")) || [];
  });
  
  const [typeOptions, setTypeOptions] = useState(() => {
    return JSON.parse(localStorage.getItem("typeOptions")) || [];
  });
  
  const [descriptionOptions, setDescriptionOptions] = useState(() => {
    return JSON.parse(localStorage.getItem("descriptionOptions")) || [];
  });
  

  // Store updated options in localStorage when they change
  useEffect(() => {
    localStorage.setItem("statusOptions", JSON.stringify(statusOptions));
  }, [statusOptions]);

  useEffect(() => {
    localStorage.setItem("conditionOptions", JSON.stringify(conditionOptions));
  }, [conditionOptions]);

  useEffect(() => {
    localStorage.setItem("locationOptions", JSON.stringify(locationOptions));
  }, [locationOptions]);
  
  useEffect(() => {
    localStorage.setItem("departmentOptions", JSON.stringify(departmentOptions));
  }, [departmentOptions]);
  
  useEffect(() => {
    localStorage.setItem("typeOptions", JSON.stringify(typeOptions));
  }, [typeOptions]);
  
  useEffect(() => {
    localStorage.setItem("descriptionOptions", JSON.stringify(descriptionOptions));
  }, [descriptionOptions]);
  

  const [newStatus, setNewStatus] = useState("");
  const [newCondition, setNewCondition] = useState("");

  useEffect(() => {
    const fetchAssets = async () => {
  //     try {
  //       const assets = await getPhysicalAssets();
  //       const lastAssetID = Math.max(...assets.map(asset => asset.assetID), 1001);
  //       setNextAssetID(lastAssetID + 1);
  //     } catch (error) {
  //       console.error("Error fetching physical assets:", error);
  //     }
    };
    fetchAssets();
  }, []);

  const onFinish = async (values) => {
    setLoading(true);

    try {
      // 1. Fetch user profile to get companyID
      const userProfile = await fetchUserProfile();
      if (!userProfile) {
        setLoading(false);
        return;
      }

      // 2. Prepare asset data
      const assetData = {
        assetID: values.assetID,
        assetName: values.assetName,
        type: values.type,
        description: values.description,
        purchaseCost: values.purchaseCost,
        purchaseDate: values.purchaseDate.format("YYYY-MM-DD"),
        department: values.department,
        location: values.location,
        status: values.status,
        condition: values.condition,
        quantity: values.quantity,
        companyID: userProfile.companyID, // Add companyID from user profile
      };

      // 3. Call service to add the asset
      await addPhysicalAsset(assetData);
      navigate("/physicalasset-list");
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  // Function to add new options dynamically and store them in localStorage
  const handleAddOption = (value, options, setOptions, setNewValue, storageKey) => {
    if (value && !options.includes(value)) {
      const updatedOptions = [...options, value];
      setOptions(updatedOptions);
      localStorage.setItem(storageKey, JSON.stringify(updatedOptions));
    }
    setNewValue("");
  };

  return (
    <div style={{ maxWidth: "500px", margin: "auto", padding: "20px", background: "#fff", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}>
      <Card title="Insert Physical Asset">
        <Form form={form} layout="vertical" onFinish={onFinish}>
        {/* <Form.Item
            name="assetID"
            label="Asset ID"
            rules={[{ message: "Please enter asset ID!" }]}
          >
            <Input placeholder="Enter asset ID" />
          </Form.Item> */}

          <Form.Item label="Asset Name" name="assetName" rules={[{ required: true, message: "Please enter asset name!" }]}>
            <Input placeholder="Enter asset name" />
          </Form.Item>

          <Form.Item label="Description" name="description" rules={[{ required: true, message: "Please select description!" }]}>
            <Select
              placeholder="Select or Enter description"
              onSearch={(value) => setNewDescription(value)}
              onChange={(value) => handleAddOption(value, descriptionOptions, setDescriptionOptions, setNewDescription, "descriptionOptions")}
              dropdownRender={menu => (
                <>
                  {menu}
                  {newDescription && !descriptionOptions.includes(newDescription) && (
                    <div style={{ padding: "5px", cursor: "pointer", color: "blue" }}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleAddOption(newDescription, descriptionOptions, setDescriptionOptions, setNewDescription, "descriptionOptions")}
                    >
                      Add "{newDescription}"
                    </div>
                  )}
                </>
              )}
              showSearch
            >
              {descriptionOptions.map(description => (
                <Option key={description} value={description}>{description}</Option>
              ))}
            </Select>
          </Form.Item>


          <Form.Item label="Type" name="type" rules={[{ required: true, message: "Please select type!" }]}>
            <Select
              placeholder="Select or Enter type"
              onSearch={(value) => setNewType(value)}
              onChange={(value) => handleAddOption(value, typeOptions, setTypeOptions, setNewType, "typeOptions")}
              dropdownRender={menu => (
                <>
                  {menu}
                  {newType && !typeOptions.includes(newType) && (
                    <div style={{ padding: "5px", cursor: "pointer", color: "blue" }}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleAddOption(newType, typeOptions, setTypeOptions, setNewType, "typeOptions")}
                    >
                      Add "{newType}"
                    </div>
                  )}
                </>
              )}
              showSearch
            >
              {typeOptions.map(type => (
                <Option key={type} value={type}>{type}</Option>
              ))}
            </Select>
          </Form.Item>


          {/* Status Dropdown with Dynamic Addition */}
          <Form.Item label="Status" name="status" rules={[{ required: true, message: "Please select status!" }]}>
            <Select
              placeholder="Select or Enter status"
              onSearch={(value) => setNewStatus(value)}
              onChange={(value) => handleAddOption(value, statusOptions, setStatusOptions, setNewStatus, "statusOptions")}
              dropdownRender={menu => (
                <>
                  {menu}
                  {newStatus && !statusOptions.includes(newStatus) && (
                    <div
                      style={{ padding: "5px", cursor: "pointer", color: "blue" }}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleAddOption(newStatus, statusOptions, setStatusOptions, setNewStatus, "statusOptions")}
                    >
                      Add "{newStatus}"
                    </div>
                  )}
                </>
              )}
              showSearch
            >
              {statusOptions.map(status => (
                <Option key={status} value={status}>
                  {status}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Condition Dropdown with Dynamic Addition */}
          <Form.Item label="Condition" name="condition" rules={[{ required: true, message: "Please enter condition!" }]}>
            <Select
              placeholder="Select or Enter condition"
              onSearch={(value) => setNewCondition(value)}
              onChange={(value) => handleAddOption(value, conditionOptions, setConditionOptions, setNewCondition, "conditionOptions")}
              dropdownRender={menu => (
                <>
                  {menu}
                  {newCondition && !conditionOptions.includes(newCondition) && (
                    <div
                      style={{ padding: "5px", cursor: "pointer", color: "blue" }}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleAddOption(newCondition, conditionOptions, setConditionOptions, setNewCondition, "conditionOptions")}
                    >
                      Add "{newCondition}"
                    </div>
                  )}
                </>
              )}
              showSearch
            >
              {conditionOptions.map(condition => (
                <Option key={condition} value={condition}>
                  {condition}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Purchase Cost" name="purchaseCost" rules={[{ required: true, message: "Enter cost!" }]}>
            <InputNumber min={0} style={{ width: "100%" }} placeholder="Enter cost" />
          </Form.Item>

          <Form.Item label="Purchase Date" name="purchaseDate" rules={[{ required: true, message: "Select date!" }]}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Department" name="department" rules={[{ required: true, message: "Please select department!" }]}>
            <Select
              placeholder="Select or Enter department"
              onSearch={(value) => setNewDepartment(value)}
              onChange={(value) => handleAddOption(value, departmentOptions, setDepartmentOptions, setNewDepartment, "departmentOptions")}
              dropdownRender={menu => (
                <>
                  {menu}
                  {newDepartment && !departmentOptions.includes(newDepartment) && (
                    <div style={{ padding: "5px", cursor: "pointer", color: "blue" }}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleAddOption(newDepartment, departmentOptions, setDepartmentOptions, setNewDepartment, "departmentOptions")}
                    >
                      Add "{newDepartment}"
                    </div>
                  )}
                </>
              )}
              showSearch
            >
              {departmentOptions.map(department => (
                <Option key={department} value={department}>{department}</Option>
              ))}
            </Select>
          </Form.Item>


          <Form.Item label="Location" name="location" rules={[{ required: true, message: "Please select location!" }]}>
            <Select
              placeholder="Select or Enter location"
              onSearch={(value) => setNewLocation(value)}
              onChange={(value) => handleAddOption(value, locationOptions, setLocationOptions, setNewLocation, "locationOptions")}
              dropdownRender={menu => (
                <>
                  {menu}
                  {newLocation && !locationOptions.includes(newLocation) && (
                    <div style={{ padding: "5px", cursor: "pointer", color: "blue" }}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleAddOption(newLocation, locationOptions, setLocationOptions, setNewLocation, "locationOptions")}
                    >
                      Add "{newLocation}"
                    </div>
                  )}
                </>
              )}
              showSearch
            >
              {locationOptions.map(location => (
                <Option key={location} value={location}>{location}</Option>
              ))}
            </Select>
          </Form.Item>


          <Form.Item label="Quantity" name="quantity" rules={[{ required: true, message: "Enter quantity!" }]}>
            <InputNumber min={1} style={{ width: "100%" }} placeholder="Enter quantity" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Add Asset
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

export default InsertPhysicalAsset;

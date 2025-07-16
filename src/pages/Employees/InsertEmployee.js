import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, InputNumber, DatePicker, Button, message, Card, Select } from "antd";
import dayjs from "dayjs";
import { addEmployee } from "../../services/employeeService"; // Add employees

const { Option } = Select;

const InsertEmployee = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
//   const [nextEmployeeID, setNextEmployeeID] = useState(null);

  const [deptOptions, setDeptOptions] = useState(() => {
    return JSON.parse(localStorage.getItem("deptOptions")) || [];
  });

  const [roleOptions, setRoleOptions] = useState(() => {
    return JSON.parse(localStorage.getItem("roleOptions")) || [];
  });

  const [newDept, setNewDept] = useState("");
  const [newRole, setNewRole] = useState("");

  useEffect(() => {
    localStorage.setItem("deptOptions", JSON.stringify(deptOptions));
  }, [deptOptions]);

  useEffect(() => {
    localStorage.setItem("roleOptions", JSON.stringify(roleOptions));
  }, [roleOptions]);

  useEffect(() => {
    const fetchEmployees = async () => {
    //   try {
    //     const response = await getEmployees(); // Fetch employees from API
    //     const employees = Array.isArray(response) ? response : response.data || [];

    //     if (employees.length > 0) {
    //       // Extract only numeric employee IDs and find the max value
    //       const employeeIds = employees
    //         .map((emp) => Number(emp.employeeId))
    //         .filter((id) => !isNaN(id));
    //       const lastEmployeeID =
    //         employeeIds.length > 0 ? Math.max(...employeeIds) : 1000; // Default to 1000 if empty
    //       setNextEmployeeID(lastEmployeeID + 1);
    //     } else {
    //       setNextEmployeeID(1);
    //     }
    //   } catch (error) {
    //     console.error("Error fetching employees:", error);
    //     setNextEmployeeID(1); // Default to 1001 in case of error
    //   }
    };

    fetchEmployees();
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const formattedValues = {
        ...values,
        // employeeId: nextEmployeeID, // Auto-incremented Employee ID
        joinDate: values.joinDate
          ? dayjs(values.joinDate).format("YYYY-MM-DD")
          : null,
      };

      const response = await addEmployee(formattedValues);

      if (response) {
        form.resetFields();
        navigate("/employee-list");
        message.success("Employee added successfully!");
      }
    } catch (error) {
      console.error("Error adding employee:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOption = (value, options, setOptions, setNewValue, storageKey) => {
    if (value && !options.includes(value)) {
      const updatedOptions = [...options, value];
      setOptions(updatedOptions);
      localStorage.setItem(storageKey, JSON.stringify(updatedOptions));
    }
    setNewValue("");
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
        <Card title="Add Employee" className="update-card">
        <Form form={form} onFinish={onFinish} layout="vertical">
        {/* Manually Entered Employee ID */}
                {/* <Form.Item
                    name="employeeId"
                    label="Employee ID"
                    rules={[{ message: 'Please enter Employee ID' }]}
                >
                    <Input placeholder="Enter employee ID" />
                </Form.Item> */}

                <Form.Item
                    name="employeeName"
                    label="Employee Name"
                    rules={[{ required: true, message: 'Please enter Employee Name' }]}
                >
                    <Input placeholder="Enter employee name" />
                </Form.Item>
                <Form.Item
                    name="dept"
                    label="Department"
                    rules={[{ required: true, message: "Please select department!" }]}
                >
                    <Select
                        placeholder="Select or Enter department"
                        onSearch={(value) => setNewDept(value)}
                        onChange={(value) =>
                            handleAddOption(
                                value,
                                deptOptions,
                                setDeptOptions,
                                setNewDept,
                                "deptOptions"
                            )
                        }
                        dropdownRender={(menu) => (
                            <>
                                {menu}
                                {newDept && !deptOptions.includes(newDept) && (
                                    <div
                                        style={{
                                            padding: "5px",
                                            cursor: "pointer",
                                            color: "blue",
                                        }}
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() =>
                                            handleAddOption(
                                                newDept,
                                                deptOptions,
                                                setDeptOptions,
                                                setNewDept,
                                                "deptOptions"
                                            )
                                        }
                                    >
                                        Add "{newDept}"
                                    </div>
                                )}
                            </>
                        )}
                        showSearch
                    >
                        {deptOptions.map((dept) => (
                            <Option key={dept} value={dept}>
                                {dept}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="role"
                    label="Role"
                    rules={[{ required: true, message: "Please select role!" }]}
                >
                    <Select
                        placeholder="Select or Enter role"
                        onSearch={(value) => setNewRole(value)}
                        onChange={(value) =>
                            handleAddOption(
                                value,
                                roleOptions,
                                setRoleOptions,
                                setNewRole,
                                "roleOptions"
                            )
                        }
                        dropdownRender={(menu) => (
                            <>
                                {menu}
                                {newRole && !roleOptions.includes(newRole) && (
                                    <div
                                        style={{
                                            padding: "5px",
                                            cursor: "pointer",
                                            color: "blue",
                                        }}
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() =>
                                            handleAddOption(
                                                newRole,
                                                roleOptions,
                                                setRoleOptions,
                                                setNewRole,
                                                "roleOptions"
                                            )
                                        }
                                    >
                                        Add "{newRole}"
                                    </div>
                                )}
                            </>
                        )}
                        showSearch
                    >
                        {roleOptions.map((role) => (
                            <Option key={role} value={role}>
                                {role}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="joinDate"
                    label="Joining Date"
                    rules={[{ required: true }]}
                >
                    <DatePicker format="YYYY-MM-DD" placeholder="Select joining date"/>
                </Form.Item>

                <Form.Item
                    name="salary"
                    label="Salary"
                    rules={[{ required: true }]}
                >
                    <InputNumber style={{ width: "100%" }} placeholder="Enter salary" />
                </Form.Item>

                <Form.Item
                    name="phoneNumber"
                    label="Phone Number"
                    rules={[{ required: true }]}
                >
                    <Input placeholder="Enter phone number" />
                </Form.Item>

                <Form.Item
                    name="emailId"
                    label="Email ID"
                    rules={[{ required: true, type: "email" }]}
                >
                    <Input placeholder="Enter email address" />
                </Form.Item>

                <Form.Item
                    name="roleID"
                    label="Role ID"
                    rules={[{ required: true }]}
                >
                    <InputNumber min={1} style={{ width: "100%" }} placeholder="Enter role ID" />
                </Form.Item>

                <Button type="primary" htmlType="submit" loading={loading}>
                    Add Employee
                </Button>
                <Button
                    onClick={() => navigate("/employee-list")}
                    style={{ marginLeft: 10 }}
                >
                    Cancel
                </Button>
            </Form>
        </Card>
    </div>
  );
};

export default InsertEmployee;
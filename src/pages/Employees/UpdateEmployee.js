import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Input, InputNumber, DatePicker, Button, message, Spin, Card } from "antd";
import dayjs from "dayjs";
import { getEmployeeById, updateEmployee } from "../../services/employeeService";

const UpdateEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [roleID, setRoleID] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false); // Track if the employee is a Super Admin

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await getEmployeeById(id);
        if (response.data) {
          setRoleID(response.data.roleID);
          setIsSuperAdmin(response.data.roleID === 1); // Check if the role is Super Admin
          form.setFieldsValue({
            employeeName: response.data.employeeName,
            dept: response.data.dept,
            role: response.data.role,
            joinDate: response.data.joinDate ? dayjs(response.data.joinDate) : null,
            salary: response.data.salary,
            phoneNumber: response.data.phoneNumber,
            emailId: response.data.emailId,
          });
        }
      } catch (error) {
        message.destroy();
        message.error(error.response?.data?.message || "Failed to fetch employee details.");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id, form]);

  const onFinish = async (values) => {

    try {
      const formattedValues = {
        ...values,
        employeeId: parseInt(id, 10),
        joinDate: values.joinDate ? values.joinDate.format("YYYY-MM-DD") : null,
        roleID,
      };

      await updateEmployee(id, formattedValues);
      message.destroy();
      message.success("Employee updated successfully!");
      navigate("/employee-list");
    } catch (error) {
      message.destroy();
      message.error(error.response?.data?.message || "Failed to update employee.");
    }
  };

  if (loading) return <Spin size="large" className="loading-spinner" />;

  return (
    <div style={{ maxWidth: "500px", margin: "auto", padding: "20px", background: "#fff", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}>
      <Card title="Update Employee" className="update-card">
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item name="employeeName" label="Employee Name" rules={[{ required: true }]} disabled={isSuperAdmin}>
            <Input />
          </Form.Item>

          <Form.Item name="dept" label="Department" rules={[{ required: true }]} disabled={isSuperAdmin}>
            <Input />
          </Form.Item>

          <Form.Item name="role" label="Role" rules={[{ required: true }]} disabled={isSuperAdmin}>
            <Input />
          </Form.Item>

          <Form.Item name="joinDate" label="Joining Date" rules={[{ required: true }]} disabled={isSuperAdmin}>
            <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="salary" label="Salary" rules={[{ required: true }]} disabled={isSuperAdmin}>
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="phoneNumber" label="Phone Number" rules={[{ required: true }]} disabled={isSuperAdmin}>
            <Input />
          </Form.Item>

          <Form.Item name="emailId" label="Email ID" rules={[{ required: true, type: "email" }]} disabled={isSuperAdmin}>
            <Input />
          </Form.Item>

          <input type="hidden" name="roleID" value={roleID} />

          {
              <Button type="primary" htmlType="submit" className="submit-button">
                Update Employee
              </Button>
          }


          {/* Show Cancel button for navigation */}
          <Button onClick={() => navigate("/employee-list")} style={{ marginLeft: 10 }}>
            Cancel
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default UpdateEmployee;

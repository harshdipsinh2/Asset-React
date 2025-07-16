import React, { useState, useRef, useEffect } from "react";
import { Form, Input, Button, Card, message, Select, Modal } from "antd";
import { checkSubscriber } from "../../services/subscriptionService";
import { loginUser, registerUser, forgotPassword, resetPassword, verifyLoginOtp } from "../../services/authService"; // Ensure verifyLoginOtp is imported
import { fetchUserProfile } from "../../services/profileService";
import { getAllCompanies, addCompany } from "../../services/companyService";

const Auth = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isOtpVerification, setIsOtpVerification] = useState(false); // New state for OTP verification
  const [otpUsername, setOtpUsername] = useState(""); // State to store username for OTP verification
  const [isEmployeeIdFilled, setIsEmployeeIdFilled] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [isCompanyModalVisible, setIsCompanyModalVisible] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyAddress, setNewCompanyAddress] = useState("");
  const formRef = useRef();

  const handleEmployeeIdChange = (e) => {
    setIsEmployeeIdFilled(!!e.target.value);
  };

  useEffect(() => {
    const loginError = localStorage.getItem("loginError");
    if (loginError) {
      message.error(loginError);
      localStorage.removeItem("loginError");
    }
  }, []);

  const showCompanyModal = () => {
    setIsCompanyModalVisible(true);
  };

  const handleCompanySubmit = async () => {
    try {
      const newCompany = await addCompany({
        companyName: newCompanyName,
        address: newCompanyAddress,
      });

      setCompanies((prev) => [...prev, newCompany]);
      formRef.current.setFieldsValue({ companyID: newCompany.companyID });

      setIsCompanyModalVisible(false);
      setNewCompanyName("");
      setNewCompanyAddress("");
    } catch (error) {
     //  console.error("Company add failed", error);
    }
  };

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await getAllCompanies();
        setCompanies(data);
      } catch (error) {
     //   console.error("Error fetching companies", error);
      }
    };
    fetchCompanies();
  }, []);

  const handleLogin = async (values) => {
    const result = await loginUser(values); // should return { success, token, message, otpRequired, username }
  
    // ✅ Step 1: If OTP is required, go to OTP flow
    if (result.success && result.otpRequired) {
      setIsOtpVerification(true);
      setOtpUsername(result.username);
      // message.info("OTP sent to your email. Please verify to continue.");
      return;
    }
  
    // ✅ Step 2: If login failed (no success or no token), redirect to login
    if (!result.success || !result.token) {
      localStorage.setItem("loginError", result.message || "Invalid login credentials.");
      window.location.href = "/login";
      return;
    }
  
    // ✅ Step 3: Handle successful login with token
    try {
      localStorage.setItem("token", result.token);
      const userProfile = await fetchUserProfile();
      if (!userProfile?.email) {
        message.error("Could not retrieve user profile.");
        return;
      }
      localStorage.setItem("email", userProfile.email);
      const isSubscribed = await checkSubscriber(userProfile.email);
      window.location.href = isSubscribed ? "/dashboard" : "/subscribe";
    } catch (error) {
    //   console.error(" Error during login or profile fetch:", error);
      message.error("An error occurred after login.");
    }
  };
  

  const handleVerifyOtp = async (values) => {
    const success = await verifyLoginOtp(otpUsername, values.otp);
    if (success) {
      setIsOtpVerification(false);
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 500);
    }
  };

  const handleRegister = async (values) => {
    const { confirmPassword, ...formValues } = values;
    const success = await registerUser(formValues);
    if (success) {
      setIsRegistering(false);
      formRef.current.resetFields();
    }
  };

  const handleForgotPassword = async (values) => {
    const { email } = values;
    const success = await forgotPassword(email);
    if (success) {
      setIsForgotPassword(false);
      setIsResettingPassword(true);
    }
  };

  const handleResetPassword = async (values) => {
    const success = await resetPassword(values.username, values.otpCode, values.newPassword);
    if (success) {
      setIsResettingPassword(false);
      message.destroy();
      message.success("Password reset successfully.");
    }
  };

  return (
    <Card
      title={
        isOtpVerification
          ? "Verify OTP"
          : isRegistering
          ? "Register"
          : isForgotPassword
          ? "Forgot Password"
          : isResettingPassword
          ? "Reset Password"
          : "Login"
      }
      className="auth-container"
    >
      <Form
        ref={formRef}
        onFinish={
          isOtpVerification
            ? handleVerifyOtp
            : isRegistering
            ? handleRegister
            : isForgotPassword
            ? handleForgotPassword
            : isResettingPassword
            ? handleResetPassword
            : handleLogin
        }
        layout="vertical"
      >
        {!isForgotPassword && !isResettingPassword && !isOtpVerification && (
          <>
            <Form.Item name="username" label="Username" rules={[{ required: true, message: "Please enter your username" }]}>
              <Input autoComplete="off" />
            </Form.Item>
          </>
        )}

        {isRegistering && (
          <>
            <Form.Item name="email" label="Email" rules={[{ required: true, message: "Please enter your email", type: "email" }]}>
              <Input />
            </Form.Item>
            <Form.Item name="phoneNumber" label="Phone Number" rules={[{ required: true, message: "Please enter your phone number" }]}>
              <Input />
            </Form.Item>
            <Form.Item name="companyID" label="Company" rules={[{ required: true, message: "Please select a company" }]}>
              <Select
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        padding: 8,
                      }}
                    >
                      <Button type="link" onClick={showCompanyModal}>
                        Can't find your company? Register
                      </Button>
                    </div>
                  </>
                )}
              >
                {companies.map((company) => (
                  <Select.Option key={company.companyID} value={company.companyID}>
                    {company.companyName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="employeeId"
              label="Employee ID (Only for Company Employees)"
              rules={[{ required: false, message: "Please enter Employee ID" }]}
            >
              <Input onChange={handleEmployeeIdChange} />
            </Form.Item>
            <Form.Item name="roleId" label="Role ID" rules={[{ required: false, message: "Please enter Role ID" }]}>
              <Input disabled={!isEmployeeIdFilled} />
            </Form.Item>

            <Modal
              title="Register New Company"
              open={isCompanyModalVisible}
              onOk={handleCompanySubmit}
              onCancel={() => setIsCompanyModalVisible(false)}
              okText="Register"
              cancelText="Cancel"
            >
              <Form layout="vertical">
                <Form.Item label="Company Name" required>
                  <Input value={newCompanyName} onChange={(e) => setNewCompanyName(e.target.value)} />
                </Form.Item>
                <Form.Item label="Company Address">
                  <Input value={newCompanyAddress} onChange={(e) => setNewCompanyAddress(e.target.value)} />
                </Form.Item>
              </Form>
            </Modal>
          </>
        )}

        {isForgotPassword && (
          <Form.Item name="email" label="Email" rules={[{ required: true, message: "Please enter your email", type: "email" }]}>
            <Input />
          </Form.Item>
        )}

        {isResettingPassword && (
          <>
            <Form.Item name="username" label="Username" rules={[{ required: true, message: "Please enter Username" }]}>
              <Input />
            </Form.Item>
            <Form.Item name="otpCode" label="OTP Code" rules={[{ required: true, message: "Please enter the OTP code" }]}>
              <Input />
            </Form.Item>
            <Form.Item name="newPassword" label="New Password" rules={[{ required: true, message: "Please enter your new password" }]}>
              <Input.Password />
            </Form.Item>
          </>
        )}

        {!isForgotPassword && !isResettingPassword && !isOtpVerification && (
          <>
            <Form.Item name="password" label="Password" rules={[{ required: true, message: "Please enter your password" }]}>
              <Input.Password autoComplete="off" />
            </Form.Item>

            {isRegistering && (
              <Form.Item
                name="confirmPassword"
                label="Confirm Password"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Please confirm your password" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Passwords do not match"));
                    },
                  }),
                ]}
              >
                <Input.Password />
              </Form.Item>
            )}
          </>
        )}

        {isOtpVerification && (
          <Form.Item name="otp" label="OTP" rules={[{ required: true, message: "Please enter the OTP" }]}>
            <Input />
          </Form.Item>
        )}

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            {isOtpVerification
              ? "Verify OTP"
              : isRegistering
              ? "Register"
              : isForgotPassword
              ? "Submit"
              : isResettingPassword
              ? "Reset Password"
              : "Login"}
          </Button>
        </Form.Item>
      </Form>

      {!isForgotPassword && !isResettingPassword && !isRegistering && !isOtpVerification && (
        <Button type="link" onClick={() => setIsForgotPassword(true)}>
          Forgot password?
        </Button>
      )}

      {!isForgotPassword && !isResettingPassword && !isOtpVerification && (
        <Button type="link" onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? "Already have an account? Login" : "New user? Register"}
        </Button>
      )}

      {isForgotPassword && !isResettingPassword && !isOtpVerification && (
        <Button type="link" onClick={() => setIsForgotPassword(false)}>
          Back to Login
        </Button>
      )}
    </Card>
  );
};

export default Auth;
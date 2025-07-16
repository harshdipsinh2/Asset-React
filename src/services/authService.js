import api from "./api";
import { message } from "antd";

// export const loginUser = async (credentials) => {
//   try {
//     const response = await api.post("/User/login", credentials);
//     if (response.status === 200) {
//       const token = response.data; // Backend returns the token
//       // Store the token securely (e.g., localStorage, HTTP-only cookie)
//       localStorage.setItem("authToken", token);
//       return { success: true, token }; // Return success and the token
//     } else {
//       return { success: false, message: response.data?.message || "Login failed" };
//     }
//   } catch (error) {
//     console.error("Login error:", error);
//     return { success: false, message: "Invalid login credentials." };
//   }
// };

export const loginUser = async (values) => {
  try {
    console.log("Sending login request with:", values);
    const response = await api.post("/User/login", values);

    console.log("Response from API:", response.data);

    if (response.data && response.data.message === "OTP sent to your email. Please verify to continue.") {
      message.success("OTP sent to your email. Please verify to continue.");
      return { success: true, otpRequired: true, username: values.username }; // Indicate OTP required
    } else if (response.data) {
        localStorage.setItem("token", response.data);
        api.defaults.headers.common["Authorization"] = `Bearer ${response.data}`;
        message.success("Logged in successfully!");
        return { success: true, otpRequired: false };
    }
    else {
      throw new Error("Login failed or no OTP message received.");
    }
  } catch (error) {
    console.error("Login error:", error);
    message.error(error.response?.data?.message || "Invalid username or password.");
    return { success: false, otpRequired: false }; // Indicate failure
  }
};

export const verifyLoginOtp = async (username, otp) => {
  try {
    console.log("Sending OTP verification request with:", { username, otpCode: otp });
    const response = await api.post("/Otp/verify-login-otp", { username, otpCode: otp });

    console.log("OTP verification response:", response.data);

    if (response.data) {
      localStorage.setItem("token", response.data);
      api.defaults.headers.common["Authorization"] = `Bearer ${response.data}`;
      message.success("OTP verified and logged in successfully!");
      return true;
    } else {
      throw new Error("OTP verification failed.");
    }
  } catch (error) {
    console.error("OTP verification error:", error);
    message.error(error.response?.data?.message || "Invalid or expired OTP.");
    return false;
  }
};

export const registerUser = async (values) => {
    try {
      console.log("Sending register request with:", values);
  
      // Remove roleId if not provided (optional)
      if (!values.roleId) {
        delete values.roleId;
      }
  
      await api.post("/User/register", values);
      message.success("Registration successful! Please log in.");
      return true;
    } catch (error) {
      console.error("Register error:", error);
      message.error(error.response?.data?.message || "Registration failed.");
      return false;
    }
  };
  

export const forgotPassword = async (email) => {
try {
console.log("Sending forgot password request with:", email);
// Ensure the email is being sent as a string in the request body
await api.post("/Otp/forgot-password", { email: email });
message.success("OTP sent to your email.");
return true;
} catch (error) {
console.error("Forgot password error:", error);
message.error(error.response?.data?.message || "Failed to send OTP.");
return false;
}
};

export const resetPassword = async (username, otpCode, newPassword) => {
try {
console.log("Sending reset password request with:", { username, otpCode, newPassword });
const response = await api.post("/Otp/reset-password", { username, otpCode, newPassword });
console.log("Reset password response:", response);
message.success(response.data.message || "Password reset successful.");
return true;
} catch (error) {
console.error("Reset password error:", error);
message.error(error.response?.data?.message || "Failed to reset password.");
return false;
}
};

export const refreshUserProfile = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await api.get("/User/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const userData = response.data;
    localStorage.setItem("user", JSON.stringify(userData));
    return userData;
  } catch (error) {
    console.error("Failed to refresh user profile:", error);
    return null;
  }
};
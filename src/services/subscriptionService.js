import api from "./api";
import { message } from "antd";

export const createSubscriptionSession = async (email) => {
  try {
    const response = await api.post("/Subscription/create-subscription-session", {
      email: email,
    });

    if (response.data && response.data.url) {
      message.success("Redirecting to payment...");
      // Redirect user to Stripe Checkout
      window.location.href = response.data.url;
    } else {
      throw new Error("No URL returned from Stripe session.");
    }
  } catch (error) {
    console.error("Error creating subscription session:", error);
    message.error(
      error.response?.data?.message || "Failed to initiate subscription session."
    );
  }
};

export const checkUserExists = async (email) => {
    try {
      const response = await api.get(`/Subscription/check-user-exists/${email}`);
      return response.data; // true or false
    } catch (error) {
      console.error("Error checking user existence:", error);
      return false;
    }
  };

  export const checkSubscriber = async (email) => {
    try {
      const response = await api.get(`/Subscription/check-subscription/${email}`);
      return response.data; // Should return true or false
    } catch (error) {
      console.error("Error checking subscriber:", error);
      return false;
    }
  };
  
  // export const regenerateToken = async () => {
  //   try {
  //     const response = await api.get("/Auth/regenerate-token"); // Or the correct route
  //     const newToken = response.data; // ✅ Directly the token string
  
  //     // Optional: Save the token to localStorage or context
  //     localStorage.setItem("token", newToken);
  
  //     return newToken;
  //   } catch (error) {
  //     console.error("Error regenerating token:", error);
  //     return null;
  //   }
  // };
  
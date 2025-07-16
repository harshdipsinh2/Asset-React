import api from "./api";
import { message } from "antd";

// Create Checkout session with Stripe
export const createCheckoutSession = async (employeeId, assetID) => {
  try {
    // Log assetID and employeeID to check their values
    console.log("Creating checkout session with AssetID:", assetID, "and EmployeeID:", employeeId);

    const response = await api.post(`/payment/create-checkout-session`, {
      AssetID: assetID,
      EmployeeId: employeeId,
    });

    message.success(response.data?.message || "Checkout session created successfully!");

    if (response.data?.url) {
      window.location.href = response.data.url; // Redirect to Stripe Checkout
    }

    return response;
  } catch (error) {
    message.error(error.response?.data?.message || "Failed to create checkout session.");
    throw error;
  }
};

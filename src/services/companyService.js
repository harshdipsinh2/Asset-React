import api from "./api";
import { message } from "antd";

// Add a new company
export const addCompany = async (companyData) => {
  try {
    // Send the company data (companyName, address, and createdDate)
    const response = await api.post("/company", companyData);
    
    return response.data; // Return the company data returned from the backend (including companyID)
  } catch (error) {
    let errorMsg =
      error.response?.data?.errors?.CompanyName?.[0] ||
      error.response?.data?.title ||
      "Failed to add company.";
    
    message.error(errorMsg);
    throw error; // Ensure the error is thrown to propagate it
  }
};

// Get company details by ID
export const getCompanyById = async (id) => {
  try {
    const response = await api.get(`/company/${id}`);
    return response.data;
  } catch (error) {
  //  const errorMsg =
  //    error.response?.data || "Failed to fetch company details.";
  //  message.error(errorMsg);
  //  throw error;
  }
};

// Get all companies
export const getAllCompanies = async () => {
  try {
    const response = await api.get("/company"); // assumes this endpoint returns a list of companies
    return response.data;
  } catch (error) {
    throw error;
  }
};

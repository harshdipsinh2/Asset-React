import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth, AuthProvider } from "./context/AuthContext";
import { checkSubscriber } from "./services/subscriptionService";
import "./styles/global.css";

import Auth from "./pages/Auth/Auth";
import Subscription from "./pages/Subscription/Subscription";
import AppLayout from "./components/AppLayout";
import UserList from "./pages/Users/UserList";
import RoleList from "./pages/Roles/RoleList";
import Profile from "./pages/Profile/Profile";
import EmployeeList from "./pages/Employees/EmployeeList";
import UpdateEmployee from "./pages/Employees/UpdateEmployee";
import InsertEmployee from "./pages/Employees/InsertEmployee";
import PhysicalAssetList from "./pages/PhysicalAssets/PhysicalAssetList";
import InsertPhysicalAsset from "./pages/PhysicalAssets/InsertPhysicalAsset";
import UpdatePhysicalAsset from "./pages/PhysicalAssets/UpdatePhysicalAsset";
import AssignSoftwareAsset from "./pages/EmployeeSoftwareAssets/AssignSoftwareAsset";
import ViewSoftwareAsset from "./pages/EmployeeSoftwareAssets/ViewSoftwareAsset";
import SoftwareAssetList from "./pages/SoftwareAssets/SoftwareAssetList";
import InsertSoftwareAsset from "./pages/SoftwareAssets/InsertSoftwareAsset";
import UpdateSoftwareAsset from "./pages/SoftwareAssets/UpdateSoftwareAsset";
import AssignPhysicalAsset from "./pages/EmployeePhysicalAssets/AssignPhysicalAsset";
import ViewPhysicalAsset from "./pages/EmployeePhysicalAssets/ViewPhysicalAsset";
import RequestAsset from "./pages/RequestAsset/RequestAsset";
import Analysis from "./pages/Analysis/Analysis";
import RequestApproval from "./pages/RequestAsset/RequestApproval";
import Dashboard from "./pages/Dashboard/Dashboard";
import HomePage from "./pages/HomePage/HomePage";
// import SubscriptionSuccess from "./pages/Subscription/SubscriptionSuccess";

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(null);
  const [hasGrantedBasicAccess, setHasGrantedBasicAccess] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkSubscription = async () => {
      const email = localStorage.getItem("email");
      if (isAuthenticated && email) {
        try {
          const exists = await checkSubscriber(email);
          setIsSubscribed(exists);
        } catch (err) {
          console.error("Subscription check failed:", err);
          setIsSubscribed(false);
        }
      } else {
        setIsSubscribed(null);
        setHasGrantedBasicAccess(false);
      }
    };
    checkSubscription();
  }, [isAuthenticated]);

  // Comment out subscription check redirect
  // if (isAuthenticated && !isSubscribed && !hasGrantedBasicAccess && 
  //     location.pathname !== "/subscribe" && 
  //     location.pathname !== "/login" && 
  //     location.pathname !== "/subscription-success")
  // {
  //   return <Navigate to="/subscribe" replace />;
  // }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/register" element={<Auth isRegistering />} />
      <Route path="/forgot-password" element={<Auth isForgotPassword />} />
      <Route path="/reset-password/:token" element={<Auth isResettingPassword />} />
      <Route path="/subscribe" element={<Subscription onBasicAccess={() => setHasGrantedBasicAccess(true)} />} />

      {/* Remove the authentication check and make all routes accessible */}
      <Route path="/*" element={<AppLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="employee-list" element={<EmployeeList />} />
        <Route path="insert-employee" element={<InsertEmployee />} />
        <Route path="update-employee/:id" element={<UpdateEmployee />} />
        <Route path="physicalasset-list" element={<PhysicalAssetList />} />
        <Route path="insert-physicalasset" element={<InsertPhysicalAsset />} />
        <Route path="update-physicalasset/:assetId" element={<UpdatePhysicalAsset />} />
        <Route path="assign-software-asset" element={<AssignSoftwareAsset />} />
        <Route path="view-software-asset" element={<ViewSoftwareAsset />} />
        <Route path="softwareasset-list" element={<SoftwareAssetList />} />
        <Route path="insert-softwareasset" element={<InsertSoftwareAsset />} />
        <Route path="update-softwareasset/:id" element={<UpdateSoftwareAsset />} />
        <Route path="assign-physical-asset" element={<AssignPhysicalAsset />} />
        <Route path="view-physical-asset" element={<ViewPhysicalAsset />} />
        <Route path="request-asset" element={<RequestAsset />} />
        
        {/* Remove isSubscribed condition */}
        <Route path="users" element={<UserList />} />
        <Route path="roles" element={<RoleList />} />
        <Route path="analysis" element={<Analysis />} />
        <Route path="approve-requests" element={<RequestApproval />} />
        
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Route>
    </Routes>
  );
};

const App = () => (
  <AuthProvider>
    <Router>
      <AppRoutes />
    </Router>
  </AuthProvider>
);

export default App;
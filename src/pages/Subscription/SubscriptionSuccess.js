import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { checkSubscriber } from "../../services/subscriptionService";
import { useAuth } from "../../context/AuthContext"; // Import useAuth

const SubscriptionSuccess = () => {
  const navigate = useNavigate();
  const { logout } = useAuth(); // Get the logout function

  useEffect(() => {
    const finalizeSubscription = async () => {
      const email = localStorage.getItem("email");

      try {
        const isSubscribed = await checkSubscriber(email);

        if (isSubscribed) {
          message.success("Subscription successful! Please login again.");
          logout();
          setTimeout(() => {
            navigate("/login", { state: { message: "Subscription successful! Please log in." } });
          }, 100); // 100 milliseconds delay (1 second)
        } else {
          logout();
          setTimeout(() => {
            navigate("/login", { state: { message: "You are not subscribed. Please log in." } });
          }, 100);
        }
      } catch (err) {
        console.error("Error verifying subscription:", err);
        message.error("Subscription verification failed.");
      }
    };

    finalizeSubscription();
  }, [navigate, logout]); // Ensure logout is in the dependency array

  return <div>Finalizing your subscription...</div>;
};

export default SubscriptionSuccess;
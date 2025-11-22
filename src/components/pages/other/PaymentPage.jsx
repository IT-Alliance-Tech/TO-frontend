import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./PaymentPage.css";

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const plan = location.state?.plan;

  if (!plan) {
    return (
      <div className="payment-container">
        <h2>No Plan Selected</h2>
        <button
          className="payment-back-btn"
          onClick={() => navigate("/subscription-plans")}
        >
          Go Back
        </button>
      </div>
    );
  }

  const handleProceedToPhonePe = () => {
    // ⏳ Navigate to processing page
    navigate("/processing");

    // ⭐ Simulating backend response - replace with real API later
    setTimeout(() => {
      const isSuccess = true; // change to false to test error page

      if (isSuccess) {
        navigate("/success");  // 🟢 Redirect to success page
      } else {
        navigate("/error");    // 🔴 Redirect to error page
      }
    }, 2000);
  };

  return (
    <div className="payment-container">
      <div className="payment-card">
        <h2 className="payment-heading">Payment Summary</h2>

        <div className="payment-plan-box">
          <h3>{plan.name}</h3>
          <p className="payment-price">{plan.price}</p>
          <p className="payment-gst">{plan.gst}</p>
          <p><strong>Validity:</strong> {plan.validity}</p>
          <p><strong>Includes:</strong> {plan.includes}</p>
        </div>

        <button
          className="payment-proceed-btn"
          onClick={handleProceedToPhonePe}
        >
          Proceed to Pay
        </button>

        <button className="payment-cancel-btn" onClick={() => navigate(-1)}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;

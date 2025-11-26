// src/components/pages/payment/PaymentPageUI.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./PaymentPage.css";

const PaymentPage= () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const plan = state?.plan;

  const [paymentMethod, setPaymentMethod] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = () => {
    if (!paymentMethod) return alert("Please select a payment method");
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      alert(`Payment successful for ${plan?.name}`);
      navigate("/subscriptions");
    }, 2000);
  };

  return (
    <div className="payment-page-container">
      <h2 className="payment-title">Payment for {plan?.name || "Subscription Plan"}</h2>

      <div className="payment-summary-card">
        <p><strong>Plan:</strong> {plan?.name}</p>
        <p><strong>Price:</strong> {plan?.price}</p>
        <p><strong>Includes:</strong> {plan?.includes}</p>
        <p><strong>Validity:</strong> {plan?.validity}</p>
      </div>

      <div className="payment-methods-container">
        <h3>Select Payment Method</h3>
        <div className="payment-method-buttons">
          <button
            className={`payment-btn ${paymentMethod === "upi" ? "selected" : ""}`}
            onClick={() => setPaymentMethod("upi")}
          >
            UPI / QR
          </button>
          <button
            className={`payment-btn ${paymentMethod === "card" ? "selected" : ""}`}
            onClick={() => setPaymentMethod("card")}
          >
            Card
          </button>
          <button
            className={`payment-btn ${paymentMethod === "wallet" ? "selected" : ""}`}
            onClick={() => setPaymentMethod("wallet")}
          >
            Wallet
          </button>
        </div>

        {paymentMethod === "upi" && (
          <div className="upi-scanner">
            <h4>Scan QR Code to Pay</h4>
            <img
              src="https://via.placeholder.com/220x220.png?text=QR+Code"
              alt="UPI QR"
            />
            <p>Open your UPI app and scan this code to complete the payment.</p>
          </div>
        )}

        {paymentMethod === "card" && (
          <div className="card-form">
            <input type="text" placeholder="Card Number" />
            <input type="text" placeholder="Expiry MM/YY" />
            <input type="text" placeholder="CVV" />
          </div>
        )}

        {paymentMethod === "wallet" && (
          <div className="wallet-options">
            <p>Select your wallet app to proceed with payment.</p>
          </div>
        )}
      </div>

      <button
        className="pay-now-btn"
        disabled={!paymentMethod || isProcessing}
        onClick={handlePayment}
      >
        {isProcessing ? "Processing..." : `Pay ${plan?.price || ""}`}
      </button>
    </div>
  );
};

export default PaymentPage;

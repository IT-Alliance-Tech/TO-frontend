// src/components/pages/other/SubscriptionPlans.jsx

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PayButton from "../other/PayNowButton";
import "./SubscriptionPlans.css";

import { useAuth } from "../../../context/AuthContext";
import { createSubscription } from "../../../config/razorpay/subscription"; // API CALL

const plans = [
  {
    id: "SILVER_PLAN_ID", 
    name: "Silver Plan",
    price: "₹599",
    gst: "+18% GST",
    includes: "Contact numbers of 6 houses",
    validity: "15 days",
    color: "#f5f5f5",
    buttonColor: "#555555",
    headingColor: "#e74c3c",
  },
  {
    id: "GOLD_PLAN_ID",
    name: "Gold Plan",
    price: "₹1199",
    gst: "+18% GST",
    includes: "Contact numbers of 19 houses",
    validity: "15 days",
    color: "#fff8e7",
    buttonColor: "linear-gradient(90deg, #f7b733, #fc4a1a)",
    headingColor: "#3498db",
  },
  {
    id: "DIAMOND_PLAN_ID",
    name: "Diamond Plan",
    price: "₹1799",
    gst: "+18% GST",
    includes: "Contact numbers of 25 houses",
    validity: "15 days",
    color: "#f5f5f5",
    buttonColor: "#3498db",
    headingColor: "#e74c3c",
  },
];

const SubscriptionPlans = () => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Load Razorpay
  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // ------------------------- SUBSCRIBE FUNCTION -------------------------
  const handleSubscribe = async (plan) => {
    try {
      const userId = user?.id || user?._id;

      if (!userId) {
        alert("Please login first!");
        return navigate("/login");
      }

      // 🔥 CALL BACKEND API
      const response = await createSubscription(plan.id, userId);

      // 🔥 VERY IMPORTANT: YOU REQUESTED THIS OUTPUT IN NETWORK RESPONSE
      console.log("Backend Subscription Response:", response);

      const {
        razorpayKey,
        razorpaySubscriptionId,
        subscriptionId,
        userId: returnedUserId,
        planId: returnedPlanId,
      } = response;

      // 🔥 For debugging (you said you need this)
      console.log("User ID from backend:", returnedUserId);
      console.log("Plan ID from backend:", returnedPlanId);
      console.log("Subscription ID:", subscriptionId);

      // Open Razorpay Popup
      const options = {
        key: razorpayKey,
        subscription_id: razorpaySubscriptionId,

        name: "TruOwners Subscription",
        description: plan.includes,
        image: "/logo.png",

        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone,
        },

        theme: { color: "#3399cc" },

        handler: function (res) {
          navigate("/subscription/success", {
            state: {
              planName: plan.name,
              paymentId: res.razorpay_payment_id,
              razorpay_subscription_id: res.razorpay_subscription_id,

              // Sending backend IDs
              subscription_id: subscriptionId,
              user_id: returnedUserId,
              plan_id: returnedPlanId,
            },
          });
        },

        modal: {
          ondismiss: () => {
            navigate("/subscription/error", {
              state: { planName: plan.name },
            });
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function () {
        navigate("/subscription/error", {
          state: { planName: plan.name },
        });
      });

      rzp.open();
    } catch (err) {
      console.error("Subscription Error:", err);
      alert("Something went wrong! Try again.");
    }
  };

  // ------------------------- UI -------------------------
  return (
    <section className="subscription-section">
      <div className="subscription-overview">
        <h2 className="subscription-section-title">Subscription Plans Overview</h2>
        <p className="subscription-section-description">
          We offer three subscription plans to provide access to property contact information.
          Each plan includes a limited number of house contact details and has a validity period of 15 days.
        </p>
      </div>

      <div className="subscription-plans-container">
        {plans.map((plan, index) => (
          <div
            key={index}
            className="subscription-plan-card"
            style={{ backgroundColor: plan.color }}
          >
            <div className="subscription-plan-header">
              <h3 className="subscription-plan-name" style={{ color: plan.headingColor }}>
                {plan.name}
              </h3>
              <p className="subscription-plan-price">
                {plan.price} <span className="subscription-gst">{plan.gst}</span>
              </p>
            </div>

            <div className="subscription-plan-body">
              <p className="subscription-plan-includes">
                <strong>Includes:</strong> {plan.includes}
              </p>

              <p className="subscription-plan-validity">
                <strong>Validity:</strong> {plan.validity}
              </p>

              <button
                className="subscription-subscribe-button"
                style={{ background: plan.buttonColor }}
                onClick={() => handleSubscribe(plan)}
              >
                Subscribe
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="subscription-paynow-container">
        <PayButton />
      </div>

      <div className="subscription-note">
        <p>
          All plans are valid for 15 days.{" "}
          <span className="subscription-tnc-link" onClick={() => setShowModal(true)}>
            T&C apply
          </span>
        </p>
      </div>

      {showModal && (
        <div className="subscription-modal-overlay">
          <div className="subscription-modal-content-light">
            <button
              className="subscription-close-modal-light"
              onClick={() => setShowModal(false)}
            >
              X
            </button>

            <h2>Terms and Conditions</h2>

            <div className="subscription-modal-summary-light">
              <p>TruOwners includes TruOwners Technologies Solutions, registered in Bengaluru, India.</p>
              <p>Privacy Policy refers to the privacy policy described in detail on our site.</p>
              <p>Account refers to the account created on the Site by the User.</p>
              <p>Agreement includes Terms and Conditions, Privacy Policy, and mutually agreed terms.</p>

              <p style={{ marginTop: "15px" }}>
                <Link to="/termcondition" className="subscription-detailed-tnc-link">
                  Click here for detailed Terms & Conditions
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SubscriptionPlans;

// src/components/pages/other/SubscriptionPlans.jsx

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SubscriptionPlans.css";

import { useAuth } from "../../../context/AuthContext";
import { API_CONFIG, buildApiUrl } from "../../../config/api";

const SubscriptionPlans = () => {
  const [showModal, setShowModal] = useState(false);
  const [plansData, setPlansData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isChecked, setIsChecked] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchSubscriptionPlans = async () => {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.SUBSCRIPTION.BASE), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) return setLoading(false);
      const data = await response.json();

      const plansArray =
        data?.data?.subscriptions && Array.isArray(data.data.subscriptions)
          ? data.data.subscriptions
          : [];

      if (plansArray.length > 0) {
        const mappedPlans = plansArray.map((plan) => ({
          id: plan._id,
          name: plan.name,
          price: `₹${plan.meta?.pricing?.basePrice || 0}`,
          gst: `+18% GST`,
          includes: `Contact numbers of ${plan.features?.housesIncluded || 0} houses`,
          validity: plan.timeLabel || `${plan.durationDays} days`,
          backendPlan: plan,
        }));

        setPlansData(mappedPlans);
      }
    } catch (err) {
      console.error("Failed to fetch subscription plans:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionPlans();
  }, []);

  const goToPaymentPage = (plan) => {
    navigate("/payment", {
      state: { plan },
    });
  };

  const handleSubscribe = async (plan) => {
    try {
      const userId = user?.id || user?._id;

      if (!userId) {
        alert("Please login first!");
        return navigate("/login");
      }

      goToPaymentPage(plan);
    } catch (err) {
      console.error("Subscription Error:", err);
      alert("Something went wrong! Try again.");
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // ✅ Option A: Use backend active subscription exactly as given
  const activeSubscription =
    user?.subscriptionStatus === "active" ? user.subscription : null;

  const activePlanId = activeSubscription?.subscriptionId?._id;

  return (
    <section className="subscription-section">

      {/* ✅ Active / No subscription / Not logged in UI */}
      {user ? (
        activeSubscription ? (
          <div className="subscription-warning-banner success-banner">
            <i>✔</i>
            Active Subscription:{" "}
            <strong>{activeSubscription.subscriptionId.name}</strong>
            &nbsp;| Expires on {formatDate(activeSubscription.endDate)}
            &nbsp;| Slots Left: {activeSubscription.available} /{" "}
            {activeSubscription.subscriptionId.accessibleSlots}
          </div>
        ) : (
          <div className="subscription-warning-banner">
            <i>❗</i>
            You do not have an active subscription. Choose a plan to access
            property contact details.
          </div>
        )
      ) : (
        <div className="subscription-warning-banner login-banner">
          <i>🔒</i> Please login to subscribe to a plan.
        </div>
      )}

      <div className="subscription-overview">
        <h2 className="subscription-section-title">Subscription Plans Overview</h2>
        <p className="subscription-section-description">
          Choose from our plans to unlock property owner contact details.
        </p>
      </div>

      {/* -------------------- PLANS -------------------- */}

      <div className="subscription-plans-container">
        {loading ? (
          <p className="subscription-loading">Loading plans...</p>
        ) : plansData.length > 0 ? (
          plansData.map((plan, index) => {
            const themeColors = {
              gold: {
                text: "#DAA520",
                button: "linear-gradient(135deg, #FFD700, #DAA520)",
                shadow: "0 10px 25px rgba(218,165,32,0.35)",
              },
              silver: {
                text: "#C0C0C0",
                button: "linear-gradient(135deg, #C0C0C0, #A9A9A9)",
                shadow: "0 10px 25px rgba(128,128,128,0.35)",
              },
              diamond: {
                text: "#5CD4FC",
                button: "linear-gradient(135deg, #7FDBFF, #39C0ED)",
                shadow: "0 10px 25px rgba(60,180,220,0.35)",
              },
            };

            const name = plan.name?.toLowerCase();
            const theme =
              name.includes("gold")
                ? themeColors.gold
                : name.includes("silver")
                ? themeColors.silver
                : name.includes("diamond")
                ? themeColors.diamond
                : {
                    text: "#1e3a8a",
                    button: "#2563eb",
                    shadow: "0 10px 25px rgba(0,0,0,0.15)",
                  };

            const isActivePlan = activePlanId === plan.id;

            return (
              <div
                key={index}
                className="subscription-plan-card"
                style={{
                  boxShadow: theme.shadow,
                  pointerEvents: isActivePlan ? "none" : "auto",
                  cursor: isActivePlan ? "not-allowed" : "pointer",
                }}
              >
                <div className="subscription-plan-header">
                  <h3
                    className="subscription-plan-name"
                    style={{ color: theme.text }}
                  >
                    {plan.name} {isActivePlan && "✔"}
                  </h3>

                  <p className="subscription-plan-price">
                    {plan.price}{" "}
                    <span className="subscription-gst">{plan.gst}</span>
                  </p>
                </div>

                <div className="subscription-plan-body">
                  <p>
                    <strong>Includes:</strong> {plan.includes}
                  </p>
                  <p>
                    <strong>Validity:</strong> {plan.validity}
                  </p>

                  {isActivePlan ? (
                    <button className="active-subscribe-button" disabled>
                      Active Plan ✓
                    </button>
                  ) : user && activeSubscription ? (
                    <button
                      className="subscription-subscribe-button"
                      style={{ background: theme.button }}
                      onClick={() => handleSubscribe(plan)}
                    >
                      Upgrade
                    </button>
                  ) : (
                    <button
                      className="subscription-subscribe-button"
                      style={{ background: theme.button }}
                      onClick={() => {
                        // ✅ NEW FIX: Always open popup even if NOT logged in
                        setSelectedPlan(plan);
                        setIsChecked(false);
                        setShowModal(true);
                      }}
                    >
                      Subscribe
                    </button>
                  )}

                  {isActivePlan && (
                    <div className="plan-status-box">
                      <p>✔ Expires: {formatDate(activeSubscription.endDate)}</p>
                      <p>
                        ✔ Slots Left: {activeSubscription.available} /{" "}
                        {activeSubscription.subscriptionId.accessibleSlots}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p>No subscription plans available.</p>
        )}
      </div>

      {/* -------------------- MODAL -------------------- */}

      {showModal && selectedPlan && (
        <div className="subscription-modal-overlay">
          <div className="subscription-modal-content">
            <button
              className="subscription-modal-close"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>

            <h2 className="modal-title">Terms & Conditions</h2>

            <div className="subscription-modal-summary">
              <div
                style={{
                  marginBottom: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => setIsChecked(e.target.checked)}
                />
                <span>I have read and agree to the Terms & Conditions</span>
              </div>

              <p>
                <Link
                  to={isChecked ? "/termcondition" : "#"}
                  className="subscription-detailed-tnc-link"
                  style={{
                    pointerEvents: isChecked ? "auto" : "none",
                    opacity: isChecked ? 1 : 0.5,
                  }}
                >
                  View Full Terms & Conditions →
                </Link>
              </p>
            </div>

            <button
              className="subscription-modal-continue"
              disabled={!isChecked}
              style={{ opacity: isChecked ? 1 : 0.5 }}
              onClick={() => {
                if (!isChecked) return;
                setShowModal(false);
                handleSubscribe(selectedPlan);
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default SubscriptionPlans;

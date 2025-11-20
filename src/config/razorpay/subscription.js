import axios from "axios";
import { API_CONFIG, buildApiUrl } from "../api";

// ---------------------------------------------------
// 1. CREATE SUBSCRIPTION FOR USER
// Endpoint → POST /user-subscriptions/subscribe
// ---------------------------------------------------
export const createSubscription = async (planId, userId) => {
  try {
    const response = await axios.post(
      buildApiUrl(API_CONFIG.SUBSCRIPTION.CREATE_FOR_USER),
      { planId, userId }
    );

    return response.data;
  } catch (error) {
    console.error("Create Subscription Error:", error);
    throw error;
  }
};

// ---------------------------------------------------
// 2. GET ACTIVE SUBSCRIPTION FOR USER
// Endpoint → GET /user-subscriptions/active/:userId
// ---------------------------------------------------
export const getUserSubscription = async () => {
  try {
    const response = await axios.get(
      `${buildApiUrl(API_CONFIG.SUBSCRIPTION.BASE)}`
    );
    return response.data;
  } catch (error) {
    console.error("Fetch User Subscription Error:", error);
    throw error;
  }
};

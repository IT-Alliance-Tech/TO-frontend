// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://tru-backend-6v7c.onrender.com/api',
  
  // Auth endpoints
  AUTH: {
    REGISTER: '/auth/register',
    VALIDATE_OTP: '/auth/validate-otp',
    SEND_OTP: '/auth/send-otp',
    LOGIN_OTP: '/auth/login/otp',
    LOGIN_PASSWORD: '/auth/login/password',

    // Forgot password flow
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    RESEND_OTP: '/auth/resend-otp'
  },
  
  // Owner endpoints
  OWNER: {
    PROPERTIES: '/owner/properties'
  },

  // Admin endpoints
  ADMIN: {
    USERS: '/admin/users',
    PROPERTIES: '/admin/properties',
    REVIEW_PROPERTY: '/admin/properties/:id/review',
    PUBLISH_PROPERTY: '/admin/properties/:id',
    BOOKINGS: '/booking/all',
    BOOKING_ANALYTICS: '/booking/analytics',
    UPDATE_BOOKING: '/booking/:id/status'
  },

  // User endpoints
  USER: {
    PROPERTIES: '/user/properties',
    WISHLIST: '/user/wishlist',
    WISHLIST_REMOVE: '/user/wishlist',
    CONTACTOWNER: '/user/unlock-contact',
    BOOKING_ADD: '/booking',
    BOOKING_UPDATE: '/booking/:id/update-time',
  },


  SUBSCRIPTION: {
    BASE: '/subscriptions',                           // localhost:5000/api/subscriptions
    CREATE_FOR_USER: '/user-subscriptions/subscribe', // POST create subscription
    ALL_SUBSCRIPTIONS: '/user-subscriptions',         // GET all subscriptions
    ACTIVE_FOR_USER: '/user-subscriptions/active/',   // GET active subscription by user → /active/:user_id
    UPGRADE: '/user-subscriptions/',                  // PUT upgrade → /:userSubscriptionId/upgrade
    GET_BY_ID: '/user-subscriptions/',                // GET → /user-subscriptions/<userSubscriptionId>
  }
}

// Helper function to build full API URL
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

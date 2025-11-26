// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://backend-to-1.onrender.com/api',
  
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

    // ✅ Correct booking endpoints
    BOOKINGS: '/admin/bookings',                // GET all bookings
    UPDATE_BOOKING_STATUS: '/booking/69243dab7b010ff976a94dc3/status',
  
    
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

  // Subscription APIs
  SUBSCRIPTION: {
    BASE: '/subscriptions',
    CREATE_FOR_USER: '/user-subscriptions/subscribe',
    USER_SUBSCRIPTIONS: '/user-subscriptions' // <-- Added this line
  },

  // PhonePe Payment APIs
  PAYMENTS: {
    INITIATE: '/payment/phonepe/initiate',
    CALLBACK: '/payment/phonepe/callback',
    STATUS: '/payment/phonepe/status'
  }
}

// Helper function to build full API URL
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

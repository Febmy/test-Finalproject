// src/lib/errors.js
// Centralized error handling utilities

/**
 * Get user-friendly error message from API error
 */
export const getFriendlyErrorMessage = (
  error,
  defaultMessage = "Terjadi kesalahan"
) => {
  if (!error) return defaultMessage;

  // Network error (no response)
  if (!error.response) {
    if (error.code === "ECONNABORTED") {
      return "Permintaan timeout. Periksa koneksi internet Anda.";
    }
    if (error.message && error.message.includes("Network Error")) {
      return "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
    }
    return "Koneksi bermasalah. Silakan coba lagi.";
  }

  const { status, data } = error.response;

  // Use server message if available
  if (data?.message) {
    // Handle validation errors from API
    if (data.errors && Array.isArray(data.errors)) {
      return data.errors[0]?.msg || data.errors[0]?.message || data.message;
    }
    return data.message;
  }

  // HTTP status based messages
  switch (status) {
    case 400:
      return "Permintaan tidak valid.";
    case 401:
      return "Sesi Anda telah berakhir. Silakan login kembali.";
    case 403:
      return "Anda tidak memiliki izin untuk mengakses ini.";
    case 404:
      return "Data tidak ditemukan.";
    case 409:
      return "Data yang sama sudah ada.";
    case 422:
      return "Data yang dimasukkan tidak valid.";
    case 429:
      return "Terlalu banyak percobaan. Coba lagi nanti.";
    case 500:
    case 502:
    case 503:
    case 504:
      return "Server sedang bermasalah. Silakan coba lagi nanti.";
    default:
      return defaultMessage;
  }
};

/**
 * Handle specific API errors
 */
export const handleApiError = (error, context = "") => {
  console.error(`API Error [${context}]:`, error);

  const message = getFriendlyErrorMessage(error);

  // You can add additional handling here, like:
  // - Log to error tracking service (Sentry, etc.)
  // - Show specific UI changes based on error type
  // - Retry logic for certain errors

  return {
    message,
    originalError: error,
    shouldRetry: error.response?.status >= 500, // Retry server errors
    isAuthError: error.response?.status === 401,
  };
};

/**
 * Validation helper for forms
 */
export const validateForm = (fields) => {
  const errors = {};

  if (fields.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(fields.email)) {
      errors.email = "Format email tidak valid";
    }
  }

  if (fields.phone) {
    const phoneRegex = /^[0-9+\-\s()]{10,}$/;
    const digits = fields.phone.replace(/\D/g, "");
    if (digits.length < 10) {
      errors.phone = "Nomor telepon minimal 10 digit";
    }
  }

  if (fields.password) {
    if (fields.password.length < 6) {
      errors.password = "Password minimal 6 karakter";
    }
  }

  return errors;
};

/**
 * Format validation errors from API response
 */
export const formatValidationErrors = (apiErrors) => {
  if (!apiErrors || !Array.isArray(apiErrors)) return {};

  const formatted = {};
  apiErrors.forEach((error) => {
    const field = error.path || error.field;
    if (field) {
      formatted[field] = error.msg || error.message;
    }
  });

  return formatted;
};

/**
 * Debounce function for API calls
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

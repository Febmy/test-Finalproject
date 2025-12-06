// src/lib/format.js

/**
 * Format currency to Indonesian Rupiah
 */
export function formatCurrency(amount) {
  if (amount === undefined || amount === null) return "Rp 0";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date to readable Indonesian format
 */
export function formatDateTime(dateString, options = {}) {
  if (!dateString) return "-";

  try {
    const date = new Date(dateString);

    // If invalid date
    if (isNaN(date.getTime())) return "-";

    const defaultOptions = {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };

    const mergedOptions = { ...defaultOptions, ...options };

    return new Intl.DateTimeFormat("id-ID", mergedOptions).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "-";
  }
}

/**
 * Format date only (without time)
 */
export function formatDate(dateString) {
  return formatDateTime(dateString, {
    hour: undefined,
    minute: undefined,
  });
}

/**
 * Format time only (without date)
 */
export function formatTime(dateString) {
  return formatDateTime(dateString, {
    day: undefined,
    month: undefined,
    year: undefined,
  });
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text, maxLength = 100) {
  if (!text) return "";
  if (text.length <= maxLength) return text;

  return text.slice(0, maxLength) + "...";
}

/**
 * Format phone number
 */
export function formatPhoneNumber(phone) {
  if (!phone) return "";

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");

  // Format: 0812-3456-7890
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{4})(\d{4})(\d{3})/, "$1-$2-$3");
  }

  // Format: 0812-3456-78
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{4})(\d{4})(\d{2})/, "$1-$2-$3");
  }

  // Return original if pattern doesn't match
  return phone;
}

/**
 * Capitalize first letter of each word
 */
export function capitalizeWords(str) {
  if (!str) return "";

  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function calculateDiscount(originalPrice, currentPrice) {
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}

export function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function generateSessionId() {
  return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getStoredSessionId() {
  let sessionId = localStorage.getItem("guest_session_id");
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem("guest_session_id", sessionId);
  }
  return sessionId;
}

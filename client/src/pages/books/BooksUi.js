// Small UI helpers used only by the library pages.
import React from "react";

export function Icon({ name, size }) {
  return (
    <span
      className="material-symbols-outlined"
      style={size ? { fontSize: size } : undefined}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}

// available/approved -> green, pending -> amber, reserved/rejected -> red, cancelled -> grey
const VARIANT = {
  available: "available",
  approved: "available",
  pending: "pending",
  reserved: "booked",
  rejected: "booked",
  cancelled: "neutral",
};

export function StatusBadge({ status }) {
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : "";
  return (
    <span className={`bk-badge bk-badge--${VARIANT[status] || "neutral"}`}>
      <span className="bk-badge__dot" />
      {label}
    </span>
  );
}

export const errorMessage = (err, fallback) => err?.response?.data?.message || fallback;

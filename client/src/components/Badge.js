// Status pill. Same status words used across all 4 modules:
// available/approved -> green, pending -> amber, reserved/rejected -> red, cancelled -> grey
import React from "react";

const VARIANT = {
  available: "available",
  approved: "available",
  pending: "pending",
  reserved: "booked",
  rejected: "booked",
  cancelled: "neutral",
};

export default function Badge({ status, label, dot = true }) {
  const variant = VARIANT[status] || "neutral";
  const text = label || (status ? status.charAt(0).toUpperCase() + status.slice(1) : "");
  return (
    <span className={`badge badge--${variant}`}>
      {dot && <span className="badge__dot" />}
      {text}
    </span>
  );
}

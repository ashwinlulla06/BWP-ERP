import React from 'react';
 
// Generic pill. tone: available | booked | pending | muted
export function Badge({ tone = 'muted', dot = true, children }) {
  return (
    <span className={`eq-badge eq-badge--${tone}`}>
      {dot && <span className="eq-badge__dot" />}
      {children}
    </span>
  );
}
 
// Booking status -> design-system colours.
// Status values are shared with Person 3 and Person 4: pending | approved | rejected | cancelled
const STATUS = {
  pending: { tone: 'pending', label: 'Pending' },
  approved: { tone: 'available', label: 'Approved' },
  rejected: { tone: 'booked', label: 'Rejected' },
  cancelled: { tone: 'muted', label: 'Cancelled' },
};
 
export default function StatusBadge({ status }) {
  const entry = STATUS[status] || { tone: 'muted', label: status || 'Unknown' };
  return <Badge tone={entry.tone}>{entry.label}</Badge>;
}
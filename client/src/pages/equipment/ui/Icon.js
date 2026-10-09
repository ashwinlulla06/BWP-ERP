import React from 'react';
 
// Material Symbols Outlined (the same icon set used in the UniReserve design).
// The font is loaded by equipment.css.
export default function Icon({ name, filled = false, size = 20, className = '' }) {
  return (
    <span
      className={`eq-icon ${className}`.trim()}
      aria-hidden="true"
      style={{ fontSize: size, fontVariationSettings: `'FILL' ${filled ? 1 : 0}` }}
    >
      {name}
    </span>
  );
}
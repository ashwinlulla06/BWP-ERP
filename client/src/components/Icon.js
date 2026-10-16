// Material Symbols icon. Browse names at https://fonts.google.com/icons
import React from "react";

export default function Icon({ name, size, className = "", style, ...rest }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`.trim()}
      style={size ? { fontSize: size, ...style } : style}
      aria-hidden="true"
      {...rest}
    >
      {name}
    </span>
  );
}

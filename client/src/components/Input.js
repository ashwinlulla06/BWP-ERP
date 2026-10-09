// Text/date/etc. input. `icon` adds a prefix glyph, size="lg" gives the 48px search height.
import React from "react";
import Icon from "./Icon";

export default function Input({ icon, size, className = "", wrapperStyle, ...props }) {
  const cls = ["input", icon && "input--icon", size === "lg" && "input--lg", className]
    .filter(Boolean)
    .join(" ");
  return (
    <div className="input-wrap" style={wrapperStyle}>
      {icon && <Icon name={icon} className="input-icon" />}
      <input className={cls} {...props} />
    </div>
  );
}

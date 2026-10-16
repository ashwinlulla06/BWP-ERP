// White surface with soft shadow. Add `interactive` for the hover lift.
import React from "react";

export default function Card({ children, interactive, className = "", style, ...rest }) {
  const cls = ["card", interactive && "card--interactive", className].filter(Boolean).join(" ");
  return (
    <div className={cls} style={style} {...rest}>
      {children}
    </div>
  );
}

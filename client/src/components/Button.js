// variant: primary (default) | secondary | tonal | outline | danger | danger-solid
// size: "sm"   pill: round ends   block: full width   icon: Material Symbols name
import React from "react";
import Icon from "./Icon";

export default function Button({
  variant = "primary",
  size,
  pill,
  block,
  icon,
  className = "",
  children,
  ...props
}) {
  const cls = [
    "btn",
    `btn--${variant}`,
    size === "sm" && "btn--sm",
    pill && "btn--pill",
    block && "btn--block",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type="button" className={cls} {...props}>
      {icon && <Icon name={icon} />}
      {children}
    </button>
  );
}

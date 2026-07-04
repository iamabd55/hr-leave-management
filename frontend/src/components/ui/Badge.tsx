import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "pending" | "approved" | "rejected" | "default";
}

export function Badge({
  className = "",
  variant = "default",
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap";

  const variants = {
    pending: "bg-blue-100 text-primary-dark",
    approved: "bg-teal-100 text-secondary",
    rejected: "bg-red-100 text-danger",
    default: "bg-gray-100 text-text-muted",
  };

  return (
    <div className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {props.children}
    </div>
  );
}

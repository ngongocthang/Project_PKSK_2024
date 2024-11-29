import React from "react";

export const Badge = ({ className = "", children }) => {
  return (
    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${className}`}>
      {children}
    </span>
  );
};

import React from "react";

export const Card = ({ children, className = "" }) => {
  return <div className={`bg-white shadow rounded ${className}`}>{children}</div>;
};

export const CardHeader = ({ children }) => {
  return <div className="border-b p-4">{children}</div>;
};

export const CardContent = ({ children }) => {
  return <div className="p-4">{children}</div>;
};

export const CardTitle = ({ children, className = "" }) => {
  return <h2 className={`text-lg font-semibold ${className}`}>{children}</h2>;
};

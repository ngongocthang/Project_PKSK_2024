import React from "react";

export const Alert = ({ variant = "default", children }) => {
  const variantClasses = {
    default: "bg-gray-100 text-gray-800",
    destructive: "bg-red-100 text-red-800",
  };

  return (
    <div className={`p-4 rounded-md ${variantClasses[variant] || ""}`}>
      {children}
    </div>
  );
};

export const AlertDescription = ({ children }) => {
  return <p className="text-sm">{children}</p>;
};

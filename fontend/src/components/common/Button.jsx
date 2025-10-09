// frontend/src/components/common/Button.jsx
import React from "react";
import "./common.css";

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  className = "",
}) => {
  const base =
    "inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium focus:outline-none transition-all duration-200 transform active:scale-95";

  const variants = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg",
    outline:
      "border border-indigo-500 text-indigo-600 hover:bg-indigo-50 shadow-sm",
    danger:
      "bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg",
    success:
      "bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg",
    gray: "bg-gray-200 text-gray-800 hover:bg-gray-300",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;

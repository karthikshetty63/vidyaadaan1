import React from "react";

const Container = ({ children, className = "", narrow = false }) => (
  <div
    className={`w-full mx-auto px-6 sm:px-10 lg:px-12 ${
      narrow ? "max-w-4xl" : "max-w-[1400px]"
    } ${className}`}
  >
    {children}
  </div>
);

export default Container;
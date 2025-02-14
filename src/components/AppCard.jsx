import React, { forwardRef } from "react";

const AppCard = forwardRef(({ children, className }, ref) => {
  return (
    <div ref={ref} className={`padding-3 margin-y-2 radius-lg app-card ${className || ""}`}>
      {children}
    </div>
  );
});

export default AppCard;

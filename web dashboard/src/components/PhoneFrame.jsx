import React from 'react';

/**
 * Samsung S-series style phone frame
 * size: "lg" (220px) | "sm" (200px)
 */
const PhoneFrame = ({ children, size = "lg", className = "", style = {} }) => {
  const shellClass = size === "sm" ? "phone-shell-sm" : "phone-shell";
  const screenClass = size === "sm" ? "phone-screen-sm" : "phone-screen";
  const notchClass = size === "sm" ? "phone-notch-sm" : "phone-notch";
  const camClass = size === "sm" ? "notch-cam-sm" : "notch-cam";
  const sensorClass = size === "sm" ? "notch-sensor-sm" : "notch-sensor";
  const powerClass = size === "sm" ? "phone-power-btn-sm" : "phone-power-btn";

  return (
    <div className={`${shellClass} ${className}`} style={style}>
      <div className={powerClass} />
      <div className={screenClass}>
        <div className={notchClass}>
          <div className={sensorClass} />
          <div className={camClass} />
        </div>
        {children}
      </div>
    </div>
  );
};

export default PhoneFrame;

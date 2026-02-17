import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const SideBar2 = ({ children }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [screenDimensions, setScreenDimensions] = useState({ width: 0, height: 0 });
  const navigate = useNavigate();
  const location = useLocation();

  

  useEffect(() => {
    const handleResize = () => {
      setScreenDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getDynamicStyles = () => {
    const { width, height } = screenDimensions;
    if (width === 0 || height === 0) return {};

    return {
      headerFontSize: Math.max(width * 0.015, 14),
      tabFontSize: Math.max(width * 0.01, 11),
      contentFontSize: Math.max(width * 0.012, 12),
      headerPadding: Math.max(width * 0.01, 8),
      tabPaddingX: Math.max(width * 0.005, 4),
      tabPaddingY: Math.max(height * 0.01, 8),
      contentPadding: Math.max(width * 0.02, 16)
    };
  };

  const styles = getDynamicStyles();

  return (
    <div className="w-screen h-screen bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div
        className="w-full bg-blue-500 flex items-center justify-center"
        style={{ height: '8vh', padding: `${styles.headerPadding || 8}px` }}
      >
        <h1
          className="font-semibold text-white text-center leading-tight"
          style={{ fontSize: `${styles.headerFontSize || 16}px` }}
        >
          Patient checkup management system - Base Hospital - Avissawella
        </h1>
      </div>
      {/* Content Area */}
      <div
        className="flex-1 overflow-y-auto bg-white"
        style={{ padding: `${styles.contentPadding || 16}px` }}
      >
        {children}
      </div>
    </div>
  );
};

export default SideBar2;

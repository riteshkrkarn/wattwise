import React from "react";
import { useAuth } from "../context/AuthContext";
import "./TopNavigation.css";

interface TopNavigationProps {
  currentPage?: string;
}

const TopNavigation: React.FC<TopNavigationProps> = ({
  currentPage = "Dashboard",
}) => {
  const { user } = useAuth();

  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Overview", path: "/dashboard" },
    { label: "Bills", path: "/bills" },
    { label: "Appliances", path: "/appliances" },
    { label: "Settings", path: "/settings" },
  ];

  return (
    <nav className="top-navigation">
      <div className="nav-left">
        <div className="nav-logo">
          <span className="gradient-text">⚡ WattWise</span>
        </div>
        <div className="nav-menu">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.path}
              className={`nav-item ${
                currentPage === item.label ? "active" : ""
              }`}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>

      <div className="nav-right">
        <div className="user-profile">
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="user-info">
            <span className="user-name">{user?.name || "User"}</span>
            <span className="user-email">
              @{user?.email?.split("@")[0] || "user"}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNavigation;

import React from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, FileText, Zap, BarChart3, Settings, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import "./AnimatedNavBar.css";

interface NavItem {
  name: string;
  url: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
}

const navItems: NavItem[] = [
  { name: "Dashboard", url: "/dashboard", icon: Home },
  { name: "Bills", url: "/bills", icon: FileText },
  { name: "Appliances", url: "/appliances", icon: Zap },
  { name: "Analytics", url: "/analytics", icon: BarChart3 },
  { name: "Settings", url: "/settings", icon: Settings },
];

export const AnimatedNavBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Derive active tab directly from location
  const activeTab =
    navItems.find((item) => location.pathname === item.url)?.name ||
    "Dashboard";

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="animated-navbar-container">
      <div className="animated-navbar">
        {/* Logo */}
        <div className="navbar-logo">
          <span className="gradient-text">⚡ WattWise</span>
        </div>

        {/* Navigation Items */}
        <div className="navbar-items">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;

            return (
              <Link
                key={item.name}
                to={item.url}
                className={`nav-link ${isActive ? "active" : ""}`}
              >
                <span className="nav-link-text">{item.name}</span>
                <span className="nav-link-icon">
                  <Icon size={18} strokeWidth={2.5} />
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="active-indicator"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                  >
                    <div className="glow-top">
                      <div className="glow-effect glow-1" />
                      <div className="glow-effect glow-2" />
                      <div className="glow-effect glow-3" />
                    </div>
                  </motion.div>
                )}
              </Link>
            );
          })}
        </div>

        {/* User Profile & Logout */}
        <div className="navbar-user">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <span className="user-name">{user?.name || "User"}</span>
          </div>
          <button
            className="logout-btn"
            onClick={handleLogout}
            title="Logout"
            aria-label="Logout"
          >
            <LogOut size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};


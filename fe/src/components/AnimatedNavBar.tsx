import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Zap, BarChart3, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AnimatedNavBar.css';

interface NavItem {
  name: string;
  url: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', url: '/dashboard', icon: Home },
  { name: 'Bills', url: '/bills', icon: FileText },
  { name: 'Appliances', url: '/appliances', icon: Zap },
  { name: 'Analytics', url: '/analytics', icon: BarChart3 },
  { name: 'Settings', url: '/settings', icon: Settings },
];

export function AnimatedNavBar() {
  const location = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const currentItem = navItems.find(item => location.pathname === item.url);
    if (currentItem) {
      setActiveTab(currentItem.name);
    }
  }, [location]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
                onClick={() => setActiveTab(item.name)}
                className={`nav-link ${isActive ? 'active' : ''}`}
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
                      type: 'spring',
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

        {/* User Profile */}
        <div className="navbar-user">
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="user-name">{user?.name || 'User'}</span>
        </div>
      </div>
    </div>
  );
}

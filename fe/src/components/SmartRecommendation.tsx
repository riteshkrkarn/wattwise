import React from 'react';
import './SmartRecommendation.css';

interface SmartRecommendationProps {
  priority: 'high' | 'medium' | 'low';
  category: 'energy' | 'cost' | 'maintenance' | 'peak';
  title: string;
  description: string;
  savings?: {
    amount: string;
    energy: string;
  };
  onAction?: () => void;
  onDismiss?: () => void;
}

const SmartRecommendation: React.FC<SmartRecommendationProps> = ({
  priority,
  category,
  title,
  description,
  savings,
  onAction,
  onDismiss,
}) => {
  const priorityConfig = {
    high: { label: 'High Priority', color: '#ff4444', icon: '🔴' },
    medium: { label: 'Recommended', color: '#ffaa00', icon: '🟡' },
    low: { label: 'Optional', color: '#44ff44', icon: '🟢' },
  };

  const categoryConfig = {
    energy: { icon: '⚡', label: 'Energy Efficiency' },
    cost: { icon: '💰', label: 'Cost Reduction' },
    maintenance: { icon: '🔧', label: 'Maintenance' },
    peak: { icon: '🕐', label: 'Peak Hours' },
  };

  return (
    <div className={`smart-recommendation priority-${priority}`}>
      <div className="recommendation-header">
        <div className="category-badge">
          <span className="category-icon">{categoryConfig[category].icon}</span>
          <span className="category-label">{categoryConfig[category].label}</span>
        </div>
        <div className="priority-badge" style={{ color: priorityConfig[priority].color }}>
          <span>{priorityConfig[priority].icon}</span>
          <span>{priorityConfig[priority].label}</span>
        </div>
      </div>

      <h3 className="recommendation-title">{title}</h3>
      <p className="recommendation-description">{description}</p>

      {savings && (
        <div className="savings-info">
          <div className="savings-item">
            <span className="savings-icon">💰</span>
            <span className="savings-value">{savings.amount}</span>
            <span className="savings-label">potential savings</span>
          </div>
          <div className="savings-item">
            <span className="savings-icon">⚡</span>
            <span className="savings-value">{savings.energy}</span>
            <span className="savings-label">energy saved</span>
          </div>
        </div>
      )}

      <div className="recommendation-actions">
        {onAction && (
          <button className="action-btn primary" onClick={onAction}>
            Take Action
          </button>
        )}
        {onDismiss && (
          <button className="action-btn secondary" onClick={onDismiss}>
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
};

export default SmartRecommendation;

import React from 'react';
import Card from './Card';
import './MetricCard.css';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit: string;
  subtitle?: string;
  icon?: string;
  trend?: string;
  size?: 'small' | 'medium' | 'large';
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon,
  trend,
  size = 'medium'
}) => {
  return (
    <Card className={`metric-card metric-card-${size}`}>
      <div className="metric-header">
        <h3 className="metric-title">{title}</h3>
        {icon && <span className="metric-icon">{icon}</span>}
      </div>
      {subtitle && <p className="metric-subtitle">{subtitle}</p>}
      <div className="metric-value-container">
        <span className="metric-value">{value}</span>
        <span className="metric-unit">{unit}</span>
      </div>
      {trend && <p className="metric-trend">{trend}</p>}
    </Card>
  );
};

export default MetricCard;

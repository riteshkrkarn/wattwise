import React from 'react';
import Card from './Card';
import './RecommendationCard.css';

interface RecommendationCardProps {
  title?: string;
  message: string;
  badgeText?: string;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  title = 'Recommendations',
  message,
  badgeText = 'Today recommendation'
}) => {
  return (
    <Card className="recommendation-card">
      <h3 className="recommendation-title">{title}</h3>
      <div className="recommendation-message">
        <p>{message}</p>
      </div>
      <div className="recommendation-badge">{badgeText}</div>
    </Card>
  );
};

export default RecommendationCard;

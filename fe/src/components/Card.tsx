import React from 'react';
import './Card.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', hover = false }) => {
  return (
    <div className={`card ${hover ? 'card-hover' : ''} ${className}`}>
      {children}
    </div>
  );
};

export default Card;

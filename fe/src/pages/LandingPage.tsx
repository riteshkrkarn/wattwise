import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="gradient-text">WattWise</span>
          </h1>
          <p className="hero-subtitle">
            Smart Energy Monitoring & Bill Tracking
          </p>
          <p className="hero-description">
            Monitor your electricity consumption, track bills, and discover insights to save money.
          </p>
          <div className="hero-buttons">
            <Button size="large" onClick={() => navigate('/signup')}>
              Get Started
            </Button>
            <Button size="large" variant="outline" onClick={() => navigate('/login')}>
              Login
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2025 WattWise. Smart Energy Monitoring Solution</p>
      </footer>
    </div>
  );
};

export default LandingPage;

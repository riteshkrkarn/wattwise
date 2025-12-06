import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Zap,
  BarChart3,
  Brain,
  ArrowRight,
  Wind,
  Moon,
  Sun,
} from "lucide-react";
import Button from "../components/Button";
import { useTheme } from "../context/ThemeDefinition";
import "./LandingPage.css";
import "../components/Footer.css";
import Footer from "../components/Footer";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [activeBar, setActiveBar] = React.useState(2);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="landing-page">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="landing-nav glass"
      >
        <div className="container nav-content">
          <div className="nav-logo">
            <Zap className="text-primary" size={24} fill="currentColor" />
            <span className="font-bold">WattWise</span>
          </div>
          <div className="nav-actions">
            <button
              onClick={toggleTheme}
              className="theme-toggle"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Button variant="ghost" onClick={() => navigate("/login")}>
              Login
            </Button>
            <Button onClick={() => navigate("/signup")}>Get Started</Button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <motion.div
            className="hero-text"
            initial="initial"
            animate="animate"
            variants={stagger}
          >
            <motion.div variants={fadeInUp} className="badge">
              <span className="badge-dot"></span>
              Smart Energy Management
            </motion.div>
            <motion.h1 variants={fadeInUp} className="hero-heading">
              Take Control of Your <br />
              <span className="gradient-text">Energy Bills</span> Today
            </motion.h1>
            <motion.p variants={fadeInUp} className="hero-subheading">
              Track consumption, predict costs with AI, and discover
              personalized ways to save money and the planet.
            </motion.p>
            <motion.div variants={fadeInUp} className="hero-cta-group">
              <Button size="large" onClick={() => navigate("/signup")}>
                Start Saving Now <ArrowRight size={18} className="ml-2" />
              </Button>
              <Button
                size="large"
                variant="outline"
                onClick={() => navigate("/login")}
              >
                View Demo
              </Button>
            </motion.div>

            <motion.div variants={fadeInUp} className="hero-stats">
              <div className="stat-item">
                <span className="stat-value">20%</span>
                <span className="stat-label">Avg. Savings</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-value">AI</span>
                <span className="stat-label">Powered Insights</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <div className="visual-circle circle-1"></div>
            <div className="visual-circle circle-2"></div>
            <div className="app-mockup glass">
              <div className="mockup-header">
                <div className="mockup-dot red"></div>
                <div className="mockup-dot yellow"></div>
                <div className="mockup-dot green"></div>
              </div>
              <div className="mockup-body">
                <div className="mockup-chart">
                  {[
                    {
                      height: "40%",
                      icon: <Zap size={16} />,
                      title: "Lighting Spike",
                      subtitle: "Turn off unused lights",
                    },
                    {
                      height: "60%",
                      icon: <BarChart3 size={16} />,
                      title: "Heater Usage",
                      subtitle: "Reduce temp by 2°C",
                    },
                    {
                      height: "50%",
                      icon: <Wind size={16} />,
                      title: "AC Usage High",
                      subtitle: "Try fan mode",
                    },
                    {
                      height: "30%",
                      icon: <Brain size={16} />,
                      title: "Standby Power",
                      subtitle: "Unplug device",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className={`chart-bar ${
                        activeBar === index ? "active" : ""
                      }`}
                      style={{ height: item.height }}
                      onMouseEnter={() => setActiveBar(index)}
                    ></div>
                  ))}
                </div>
                <div className="mockup-info glass">
                  <div className="info-icon">
                    {
                      [
                        {
                          icon: <Zap size={16} />,
                          title: "Lighting Spike",
                          subtitle: "Turn off unused lights",
                        },
                        {
                          icon: <BarChart3 size={16} />,
                          title: "Heater Usage",
                          subtitle: "Reduce temp by 2°C",
                        },
                        {
                          icon: <Wind size={16} />,
                          title: "AC Usage High",
                          subtitle: "Try fan mode",
                        },
                        {
                          icon: <Brain size={16} />,
                          title: "Standby Power",
                          subtitle: "Unplug device",
                        },
                      ][activeBar].icon
                    }
                  </div>
                  <div className="info-text">
                    <div className="info-title">
                      {
                        [
                          {
                            title: "Lighting Spike",
                            subtitle: "Turn off unused lights",
                          },
                          {
                            title: "Heater Usage",
                            subtitle: "Reduce temp by 2°C",
                          },
                          { title: "AC Usage High", subtitle: "Try fan mode" },
                          { title: "Standby Power", subtitle: "Unplug device" },
                        ][activeBar].title
                      }
                    </div>
                    <div className="info-subtitle">
                      {
                        [
                          {
                            title: "Lighting Spike",
                            subtitle: "Turn off unused lights",
                          },
                          {
                            title: "Heater Usage",
                            subtitle: "Reduce temp by 2°C",
                          },
                          { title: "AC Usage High", subtitle: "Try fan mode" },
                          { title: "Standby Power", subtitle: "Unplug device" },
                        ][activeBar].subtitle
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">Why WattWise?</h2>
            <p className="section-subtitle">
              Everything you need to optimize your energy usage.
            </p>
          </div>

          <div className="features-grid">
            <FeatureCard
              icon={<BarChart3 size={32} />}
              title="Real-time Analytics"
              description="Visualize your daily and monthly consumption patterns with beautiful interactive charts."
              delay={0.1}
            />
            <FeatureCard
              icon={<Brain size={32} />}
              title="AI Predictions"
              description="Our advanced AI agents predict your next month's bill based on usage and weather data."
              delay={0.2}
            />
            <FeatureCard
              icon={<Zap size={32} />}
              title="Smart Recommendations"
              description="Get personalized, actionable tips to reduce appliance usage and cut your carbon footprint."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="steps-section">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">How It Works</h2>
          </div>
          <div className="steps-container">
            <Step
              number="01"
              title="Upload Bill"
              description="Simply upload your electricity bill PDF or enter data manually."
            />
            <Step
              number="02"
              title="AI Analysis"
              description="We analyze your appliances and usage patterns."
            />
            <Step
              number="03"
              title="Start Saving"
              description="Get instant insights and notifications to save money."
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) => (
  <motion.div
    className="feature-card glass-hover"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
  >
    <div className="feature-icon">{icon}</div>
    <h3 className="feature-title">{title}</h3>
    <p className="feature-description">{description}</p>
  </motion.div>
);

const Step = ({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) => (
  <div className="step-item">
    <div className="step-number">{number}</div>
    <div className="step-content">
      <h3 className="step-title">{title}</h3>
      <p className="step-description">{description}</p>
    </div>
  </div>
);

export default LandingPage;

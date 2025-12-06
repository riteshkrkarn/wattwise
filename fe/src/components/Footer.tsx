import React from "react";
import { Zap, Github, Twitter, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer: React.FC = () => {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="brand-logo">
            <Zap size={24} className="text-primary" fill="currentColor" />
            <span className="font-bold">WattWise</span>
          </div>
          <p className="footer-desc">
            Empowering you to take control of your energy consumption and build
            a sustainable future, one watt at a time.
          </p>
          <div className="social-links">
            <a href="#" className="social-link" aria-label="GitHub">
              <Github size={20} />
            </a>
            <a href="#" className="social-link" aria-label="Twitter">
              <Twitter size={20} />
            </a>
            <a href="#" className="social-link" aria-label="LinkedIn">
              <Linkedin size={20} />
            </a>
          </div>
        </div>

        <div className="footer-links">
          <div className="link-column">
            <h4>Product</h4>
            <Link to="/features">Features</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/estimation">Estimation</Link>
            <Link to="/appliances">Appliances</Link>
          </div>
          <div className="link-column">
            <h4>Company</h4>
            <Link to="/about">About Us</Link>
            <Link to="/careers">Careers</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div className="link-column">
            <h4>Legal</h4>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/cookies">Cookie Policy</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom container">
        <p>© {new Date().getFullYear()} WattWise. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

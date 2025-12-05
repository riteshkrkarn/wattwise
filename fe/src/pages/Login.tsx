import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import './Auth.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) return;

    setIsLoading(true);

    // Simulate API delay
    setTimeout(() => {
      try {
        // Mock authentication (bypass API for now)
        const mockUser = {
          id: '1',
          name: formData.email.split('@')[0],
          email: formData.email,
        };
        const mockToken = 'mock-jwt-token-' + Date.now();

        login(mockUser, mockToken);
        navigate('/dashboard');
      } catch (error) {
        setApiError(error instanceof Error ? error.message : 'Login failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }, 500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="gradient-text">WattWise</h1>
          <p className="auth-subtitle">Welcome back! Please login to your account.</p>
        </div>

        <Card className="auth-card">
          <h2 className="auth-title">Login</h2>

          {apiError && (
            <div className="error-banner">{apiError}</div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />

            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
            />

            <Button type="submit" size="large" isLoading={isLoading} className="auth-button">
              Login
            </Button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/signup" className="auth-link">
                Sign up here
              </Link>
            </p>
          </div>
        </Card>

        <div className="auth-back">
          <Link to="/" className="back-link">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

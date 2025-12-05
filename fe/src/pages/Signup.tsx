import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import './Auth.css';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const getPasswordStrength = (password: string): string => {
    if (password.length === 0) return '';
    if (password.length < 6) return 'weak';
    if (password.length < 10) return 'medium';
    return 'strong';
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

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

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
          name: formData.name,
          email: formData.email,
        };
        const mockToken = 'mock-jwt-token-' + Date.now();

        login(mockUser, mockToken);
        navigate('/dashboard');
      } catch (error) {
        setApiError(error instanceof Error ? error.message : 'Signup failed. Please try again.');
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

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="gradient-text">WattWise</h1>
          <p className="auth-subtitle">Create your account and start saving energy today!</p>
        </div>

        <Card className="auth-card">
          <h2 className="auth-title">Sign Up</h2>

          {apiError && (
            <div className="error-banner">{apiError}</div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <Input
              label="Full Name"
              type="text"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
            />

            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />

            <div>
              <Input
                label="Password"
                type="password"
                name="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
              />
              {passwordStrength && (
                <div className={`password-strength password-${passwordStrength}`}>
                  Strength: {passwordStrength}
                </div>
              )}
            </div>

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
            />

            <Button type="submit" size="large" isLoading={isLoading} className="auth-button">
              Create Account
            </Button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Login here
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

export default Signup;

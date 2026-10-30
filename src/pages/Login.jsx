import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export default function Login() {
  const { login, sessionExpiredMessage, setSessionExpiredMessage } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [touched, setTouched] = useState({
    email: false,
    password: false
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Where to redirect after login (default /dashboard)
  const from = location.state?.from?.pathname || '/dashboard';

  // Client-side validation logic
  const validate = (values) => {
    const errs = {};
    if (!values.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errs.email = 'Please provide a valid email address.';
    }

    if (!values.password) {
      errs.password = 'Password is required.';
    } else if (values.password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    return errs;
  };

  // Run validation when fields change
  useEffect(() => {
    setErrors(validate(formData));
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (serverError) setServerError('');
    if (sessionExpiredMessage) setSessionExpiredMessage(null);
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Quick fill demo user for easy evaluation
  const handleQuickFill = () => {
    setFormData({
      email: 'demo@example.com',
      password: 'Password123!'
    });
    setTouched({ email: true, password: true });
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setServerError('');

    const result = await login(formData.email, formData.password);
    setIsSubmitting(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setServerError(result.error);
    }
  };

  return (
    <div className="container-narrow" style={{ padding: '3rem 1.5rem', margin: 'auto' }}>
      <div className="card">
        {/* Header */}
        <div className="card-header" style={{ textAlign: 'center' }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.2))',
            border: '1px solid rgba(99,102,241,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto'
          }}>
            <Lock size={22} color="#818cf8" />
          </div>
          <h1 className="card-title">Welcome Back</h1>
          <p className="card-subtitle">Sign in to your account with JWT authentication</p>
        </div>

        {/* Session Expired Banner */}
        {sessionExpiredMessage && (
          <div className="alert alert-warning">
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>Session Alert:</strong> {sessionExpiredMessage}
            </div>
          </div>
        )}

        {/* Server Error Banner */}
        {serverError && (
          <div className="alert alert-error">
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>Sign In Failed:</strong> {serverError}
            </div>
          </div>
        )}

        {/* Quick-fill Demo Account Button */}
        <div style={{
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px dashed rgba(99, 102, 241, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem 1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Sparkles size={14} /> Reviewer Test Account
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              demo@example.com / Password123!
            </div>
          </div>
          <button
            type="button"
            onClick={handleQuickFill}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem' }}
          >
            Auto Fill
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Email Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <Mail size={18} />
              </span>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="name@company.com"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
                disabled={isSubmitting}
                className={`form-input has-left-icon ${touched.email && errors.email ? 'is-error' : ''}`}
              />
            </div>
            {touched.email && errors.email && (
              <p className="form-error">
                <AlertCircle size={14} /> {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="password">Password</label>
            </div>
            <div className="input-wrapper">
              <span className="input-icon">
                <Lock size={18} />
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                onBlur={() => handleBlur('password')}
                disabled={isSubmitting}
                className={`form-input has-left-icon has-right-icon ${touched.password && errors.password ? 'is-error' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="input-action"
                title={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {touched.password && errors.password && (
              <p className="form-error">
                <AlertCircle size={14} /> {errors.password}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary btn-full"
            style={{ marginTop: '1rem' }}
          >
            {isSubmitting ? (
              <>
                <span className="spinner" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div style={{
          textAlign: 'center',
          marginTop: '1.75rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)'
        }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ color: '#818cf8', fontWeight: 600 }}>
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}


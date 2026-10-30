import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, UserPlus, ShieldCheck } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute password strength
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'None' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', class: 'weak' };
    if (score <= 3) return { score: 2, label: 'Medium', class: 'medium' };
    return { score: 3, label: 'Strong', class: 'strong' };
  };

  const strength = getPasswordStrength(formData.password);

  // Validation
  const validate = (values) => {
    const errs = {};

    if (!values.name.trim()) {
      errs.name = 'Full name is required.';
    } else if (values.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters.';
    }

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

    if (!values.confirmPassword) {
      errs.confirmPassword = 'Confirmation password is required.';
    } else if (values.confirmPassword !== values.password) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    return errs;
  };

  useEffect(() => {
    setErrors(validate(formData));
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (serverError) setServerError('');
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true
    });

    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setServerError('');

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password
    });

    setIsSubmitting(false);

    if (result.success) {
      navigate('/dashboard', { replace: true });
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
            background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(99,102,241,0.2))',
            border: '1px solid rgba(6,182,212,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto'
          }}>
            <UserPlus size={22} color="#06b6d4" />
          </div>
          <h1 className="card-title">Create an Account</h1>
          <p className="card-subtitle">Register to receive a signed JWT authentication token</p>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="alert alert-error">
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>Registration Failed:</strong> {serverError}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Name Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <User size={18} />
              </span>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Jane Doe"
                value={formData.name}
                onChange={handleChange}
                onBlur={() => handleBlur('name')}
                disabled={isSubmitting}
                className={`form-input has-left-icon ${touched.name && errors.name ? 'is-error' : ''}`}
              />
            </div>
            {touched.name && errors.name && (
              <p className="form-error">
                <AlertCircle size={14} /> {errors.name}
              </p>
            )}
          </div>

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
                placeholder="jane@company.com"
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
            <label className="form-label" htmlFor="password">Password</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <Lock size={18} />
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimum 6 characters"
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

            {/* Password Strength Indicator */}
            {formData.password && (
              <div style={{ marginTop: '0.4rem' }}>
                <div className="strength-bar-container">
                  <div className={`strength-step ${strength.score >= 1 ? strength.class : ''}`} />
                  <div className={`strength-step ${strength.score >= 2 ? strength.class : ''}`} />
                  <div className={`strength-step ${strength.score >= 3 ? strength.class : ''}`} />
                </div>
                <div className="strength-label">Strength: {strength.label}</div>
              </div>
            )}

            {touched.password && errors.password && (
              <p className="form-error">
                <AlertCircle size={14} /> {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <Lock size={18} />
              </span>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={() => handleBlur('confirmPassword')}
                disabled={isSubmitting}
                className={`form-input has-left-icon ${touched.confirmPassword && errors.confirmPassword ? 'is-error' : ''}`}
              />
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="form-error">
                <AlertCircle size={14} /> {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary btn-full"
            style={{ marginTop: '1.25rem' }}
          >
            {isSubmitting ? (
              <>
                <span className="spinner" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Complete Registration</span>
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
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#818cf8', fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}


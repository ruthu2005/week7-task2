import React from 'react';
  import { Link, NavLink, useNavigate } from 'react-router-dom';
  import { useAuth } from '../context/AuthContext';
  import { Shield, LayoutDashboard, User, LogOut, LogIn, UserPlus } from 'lucide-react';

  export default function Navbar() {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
      logout();
      navigate('/login');
    };

    return (
      <header className="navbar">
        <div className="container nav-inner">
          {/* Brand Logo */}
          <Link to="/" className="brand-link">
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Shield size={18} color="#fff" />
            </div>
            <span>AuthShield</span>
            <span className="brand-badge">JWT Ready</span>
          </Link>

          {/* Center Links */}
          <nav className="nav-links">
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Home
            </NavLink>
            {isAuthenticated && (
              <>
                <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <LayoutDashboard size={15} style={{ display: 'inline', marginRight: 4, verticalAlign: -2 }} />
                  Dashboard
                </NavLink>
                <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <User size={15} style={{ display: 'inline', marginRight: 4, verticalAlign: -2 }} />
                  Profile
                </NavLink>
              </>
            )}
          </nav>

          {/* Auth Status & Actions */}
          <div className="nav-auth-group">
            {isAuthenticated ? (
              <>
                <div className="user-pill">
                  <div className="user-avatar">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="user-pill-name">{user?.name || user?.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn btn-danger btn-sm"
                  title="Log out of session"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline btn-sm">
                  <LogIn size={14} />
                  <span>Login</span>
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  <UserPlus size={14} />
                  <span>Register</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
    );
  }

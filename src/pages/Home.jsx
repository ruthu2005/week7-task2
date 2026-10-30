import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Key,
  Layers,
  ArrowRight,
  Lock,
  RefreshCw,
  Cpu,
  CheckCircle2,
  FileCode,
  LayoutDashboard
} from 'lucide-react';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem 5rem 1.5rem' }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', maxWidth: 840, margin: '0 auto 4rem auto' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.35rem 0.85rem',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(99, 102, 241, 0.15)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          color: '#a5b4fc',
          fontSize: '0.825rem',
          fontWeight: 600,
          marginBottom: '1.5rem'
        }}>
          <ShieldCheck size={16} />
          <span>Full-Stack Web Development Internship &bull; Week 7 Task 2</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          color: '#fff',
          marginBottom: '1.25rem'
        }}>
          Seamless React Integration with <span style={{
            background: 'linear-gradient(135deg, #818cf8, #06b6d4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>JWT Authentication</span>
        </h1>

        <p style={{
          fontSize: '1.15rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          marginBottom: '2rem'
        }}>
          A complete, production-ready implementation of client-side JWT authorization.
          Featuring dynamic Axios request interceptors, React Context session management,
          route protection guards, and real-time token expiration handling.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary btn-lg">
              <LayoutDashboard size={18} />
              <span>Enter Dashboard</span>
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary btn-lg">
                <span>Sign In Demo</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/register" className="btn btn-secondary btn-lg">
                <span>Create New Account</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* 4 Feature Pillars Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1.5rem',
        marginBottom: '4rem'
      }}>
        {/* Pillar 1 */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: 'rgba(99, 102, 241, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#818cf8',
            marginBottom: '1rem'
          }}>
            <Key size={22} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
            Axios Interceptor Layer
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Outbound HTTP requests automatically append the <code>Authorization: Bearer &lt;token&gt;</code> header. Responses with status 401 trigger automatic session clean-up.
          </p>
        </div>

        {/* Pillar 2 */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: 'rgba(6, 182, 212, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#22d3ee',
            marginBottom: '1rem'
          }}>
            <Layers size={22} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
            React Context API Store
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Global <code>AuthContext</code> maintains user session state, handles login/register/logout actions, and broadcasts status changes across all components.
          </p>
        </div>

        {/* Pillar 3 */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#34d399',
            marginBottom: '1rem'
          }}>
            <Lock size={22} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
            Protected Route Guards
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Restricts unauthorized access to private views (<code>/dashboard</code>, <code>/profile</code>). Preserves requested route in navigation state for post-login return.
          </p>
        </div>

        {/* Pillar 4 */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: 'rgba(245, 158, 11, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fbbf24',
            marginBottom: '1rem'
          }}>
            <RefreshCw size={22} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
            Automatic Session Persistence
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Verifies token validity and client expiration on page reload, hydrating user state from <code>/api/auth/me</code> smoothly without screen flicker.
          </p>
        </div>
      </div>

      {/* Code Architecture Overview */}
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <FileCode size={22} color="#818cf8" />
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#fff' }}>
            Core Architectural Flow
          </h2>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          Here is how the authentication handshake operates across our React single-page application and backend API:
        </p>

        <div style={{
          background: '#0d1117',
          padding: '1.5rem',
          borderRadius: 'var(--radius-md)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85rem',
          color: '#cbd5e1',
          lineHeight: 1.7,
          overflowX: 'auto',
          border: '1px solid var(--border-subtle)'
        }}>
          <div>1. <span style={{ color: '#818cf8' }}>[Client]</span> User submits credentials via &lt;Login /&gt; form</div>
          <div>2. <span style={{ color: '#06b6d4' }}>[API]</span> authService.login() posts to <code>/api/auth/login</code></div>
          <div>3. <span style={{ color: '#34d399' }}>[Backend]</span> Validates bcrypt password hash and generates signed JWT</div>
          <div>4. <span style={{ color: '#fbbf24' }}>[Storage]</span> Token stored in localStorage (TOKEN_KEY) & React AuthContext state</div>
          <div>5. <span style={{ color: '#a78bfa' }}>[Axios]</span> Request interceptor injects: <code>Authorization: Bearer &lt;token&gt;</code></div>
          <div>6. <span style={{ color: '#f43f5e' }}>[Guard]</span> ProtectedRoute verifies isAuthenticated & grants access to &lt;Dashboard /&gt;</div>
          <div>7. <span style={{ color: '#38bdf8' }}>[Persistence]</span> Page reload validates token with <code>/api/auth/me</code></div>
        </div>
      </div>
    </div>
  );
}


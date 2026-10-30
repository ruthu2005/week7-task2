import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Calendar, Key, CheckCircle, Smartphone } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: 860 }}>
      {/* Profile Header */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 800,
            color: '#fff',
            boxShadow: '0 4px 16px rgba(99,102,241,0.35)'
          }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>
                {user?.name || 'Authenticated User'}
              </h1>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#6ee7b7',
                border: '1px solid rgba(16, 185, 129, 0.4)'
              }}>
                {user?.role || 'Active Member'}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '0.35rem' }}>
              Account managed under JSON Web Token (JWT) stateless authorization
            </p>
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
            <User size={18} color="#818cf8" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>User Identity</h3>
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Unique ID: </span>
              <code style={{ color: '#fff', fontSize: '0.8rem' }}>{user?.id || 'user_demo_01'}</code>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Full Name: </span>
              <strong style={{ color: '#fff' }}>{user?.name}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Designated Role: </span>
              <span style={{ color: '#a5b4fc' }}>{user?.role}</span>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
            <Mail size={18} color="#06b6d4" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>Contact & Access</h3>
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Email Address: </span>
              <strong style={{ color: '#fff' }}>{user?.email}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Verification Status: </span>
              <span style={{ color: '#6ee7b7' }}>Verified Account</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Created At: </span>
              <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Route Protection Explanation Card */}
      <div className="card" style={{ padding: '1.75rem', background: 'rgba(99, 102, 241, 0.05)', borderColor: 'rgba(99, 102, 241, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
          <Shield size={20} color="#818cf8" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
            About Route Protection on this Page
          </h3>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          This <code>/profile</code> view is wrapped with the same <code>&lt;ProtectedRoute&gt;</code> guard as the dashboard.
          If an unauthenticated client tries navigating here directly, the route guard intercepts the attempt, caches this URL inside
          <code>location.state.from</code>, and redirects the user to <code>/login</code>.
          Once the user enters valid credentials, the app transparently navigates them right back here.
        </p>
      </div>
    </div>
  );
}


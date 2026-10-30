import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container-narrow" style={{ padding: '5rem 1.5rem', textAlign: 'center', margin: 'auto' }}>
      <div className="card">
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'rgba(244, 63, 94, 0.15)',
          color: '#fb7185',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem auto'
        }}>
          <ShieldAlert size={32} />
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
          404 - Page Not Found
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.75rem' }}>
          The requested page route does not exist or has been relocated.
        </p>
        <Link to="/" className="btn btn-primary">
          <Home size={16} />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
}

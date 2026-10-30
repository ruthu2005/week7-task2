import React, { useState, useEffect } from 'react';
import { useAuth, decodeToken } from '../context/AuthContext';
import authService from '../services/authService';
import {
  Shield,
  Key,
  Clock,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Zap,
  Server,
  Lock,
  ExternalLink
} from 'lucide-react';

export default function Dashboard() {
  const { user, token, setTestToken } = useAuth();

  const [metrics, setMetrics] = useState(null);
  const [activities, setActivities] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [apiStatusMessage, setApiStatusMessage] = useState(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [isSimulatingExpire, setIsSimulatingExpire] = useState(false);

  // Decoded JWT inspection
  const decodedPayload = decodeToken(token);

  // Calculate human-readable expiration
  const getExpirationInfo = () => {
    if (!decodedPayload || !decodedPayload.exp) return 'No expiry claim found';
    const expiresAt = new Date(decodedPayload.exp * 1000);
    const diffMs = expiresAt.getTime() - Date.now();
    if (diffMs <= 0) return 'Expired';
    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hours > 0 ? `${hours}h ` : ''}${remMins}m remaining (${expiresAt.toLocaleTimeString()})`;
  };

  // Fetch protected dashboard data using Axios client (verifies Authorization header injection)
  const fetchDashboardData = async () => {
    setIsLoadingData(true);
    setApiStatusMessage(null);
    try {
      const [metricsRes, actRes] = await Promise.all([
        authService.getDashboardMetrics(),
        authService.getDashboardActivities()
      ]);
      setMetrics(metricsRes.metrics);
      setActivities(actRes.activities);
      setApiStatusMessage({
        type: 'success',
        text: 'Successfully fetched protected data via Axios with Bearer token header.'
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setApiStatusMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to fetch protected data.'
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCopyToken = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  // Test simulation: injects an expired token to demonstrate Axios 401 interceptor handling
  const handleSimulateExpiredToken = async () => {
    setIsSimulatingExpire(true);
    try {
      const res = await authService.simulateExpiredToken();
      // Inject expired token into storage and context
      setTestToken(res.token);
      // Immediately fire an authorized request to trigger the 401 interceptor
      await authService.getDashboardMetrics();
    } catch (err) {
      // Axios interceptor will catch 401, clear storage, and emit auth:session_expired event
      console.log('Expired token triggered 401 interceptor as expected:', err.message);
    } finally {
      setIsSimulatingExpire(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(6, 182, 212, 0.1))',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.75rem 2rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#fff',
            boxShadow: '0 4px 12px rgba(99,102,241,0.4)'
          }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>
                Welcome back, {user?.name || 'Developer'}
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
                {user?.role || 'Authenticated'}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '0.25rem' }}>
              Logged in as <strong style={{ color: '#fff' }}>{user?.email}</strong> &bull; Protected Route Active
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={fetchDashboardData}
            disabled={isLoadingData}
            className="btn btn-secondary btn-sm"
          >
            <RefreshCw size={14} className={isLoadingData ? 'spinner' : ''} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* API Status Alert */}
      {apiStatusMessage && (
        <div className={`alert ${apiStatusMessage.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {apiStatusMessage.type === 'success' ? (
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          ) : (
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          )}
          <span>{apiStatusMessage.text}</span>
        </div>
      )}

      {/* Stat Cards Grid */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <Shield size={24} />
          </div>
          <div>
            <div className="stat-label">Auth Status</div>
            <div className="stat-value" style={{ color: '#6ee7b7' }}>Verified</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }}>
            <Key size={24} />
          </div>
          <div>
            <div className="stat-label">Security Protocol</div>
            <div className="stat-value" style={{ fontSize: '1.25rem' }}>JWT Bearer</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <Activity size={24} />
          </div>
          <div>
            <div className="stat-label">API Requests (Today)</div>
            <div className="stat-value">{metrics?.apiRequestsToday ?? '142+'}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="stat-label">Token Expiration</div>
            <div className="stat-value" style={{ fontSize: '1.15rem' }}>{getExpirationInfo().split(' ')[0]}</div>
          </div>
        </div>
      </div>

      {/* Main Grid: JWT Inspector + Verification Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* JWT Inspector Card */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <Key size={20} color="#818cf8" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
                Active JWT Token Inspector
              </h2>
            </div>
            <button
              onClick={handleCopyToken}
              className="btn btn-secondary btn-sm"
              title="Copy Raw Token"
            >
              {copiedToken ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
              <span>{copiedToken ? 'Copied!' : 'Copy JWT'}</span>
            </button>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Stored securely in browser memory / localStorage and automatically appended via the Axios request interceptor:
          </p>

          {/* Raw Token Box */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              RAW AUTHORIZATION BEARER TOKEN
            </div>
            <div className="jwt-code-box" style={{ maxHeight: '85px', overflowY: 'auto' }}>
              <span className="jwt-part-header">{token?.split('.')[0] || 'header'}</span>
              <span className="jwt-dot">.</span>
              <span className="jwt-part-payload">{token?.split('.')[1] || 'payload'}</span>
              <span className="jwt-dot">.</span>
              <span className="jwt-part-signature">{token?.split('.')[2] || 'signature'}</span>
            </div>
          </div>

          {/* Decoded Claims Box */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              DECODED CLIENT CLAIMS (PAYLOAD)
            </div>
            <pre className="jwt-code-box" style={{ color: '#a5b4fc', fontSize: '0.8rem' }}>
              {JSON.stringify(decodedPayload, null, 2)}
            </pre>
          </div>
        </div>

        {/* Interactive Testing & Verification Suite */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
            <Zap size={20} color="#06b6d4" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
              Authentication Verification Lab
            </h2>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Test your frontend-to-backend integration features directly against the live API:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Action 1: Test Interceptor Header Injection */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem'
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>
                  1. Test Axios Bearer Injection
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Calls <code style={{ color: '#06b6d4' }}>GET /api/dashboard/metrics</code> with Bearer header.
                </div>
              </div>
              <button
                onClick={fetchDashboardData}
                disabled={isLoadingData}
                className="btn btn-secondary btn-sm"
              >
                Send Request
              </button>
            </div>

            {/* Action 2: Simulate Token Expiration (Step 6) */}
            <div style={{
              background: 'rgba(244, 63, 94, 0.05)',
              border: '1px solid rgba(244, 63, 94, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem'
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fda4af' }}>
                  2. Simulate Token Expiration (401 Interceptor)
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Swaps with an expired token and triggers API call to verify automatic logout & redirection.
                </div>
              </div>
              <button
                onClick={handleSimulateExpiredToken}
                disabled={isSimulatingExpire}
                className="btn btn-danger btn-sm"
              >
                {isSimulatingExpire ? 'Testing...' : 'Test 401'}
              </button>
            </div>

            {/* Action 3: Token Persistence Info */}
            <div style={{
              background: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem'
            }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} /> 3. Automatic Session Persistence
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                Reload this page (<kbd style={{ background: '#1f2937', padding: '2px 6px', borderRadius: 4 }}>Ctrl+R</kbd> or <kbd style={{ background: '#1f2937', padding: '2px 6px', borderRadius: 4 }}>F5</kbd>). Your session remains active without abrupt logouts or redirects.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audit & Activity Log */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
          <Activity size={20} color="#818cf8" />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
            Protected Activity Stream
          </h2>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>EVENT TYPE</th>
                <th style={{ padding: '0.75rem 1rem' }}>DESCRIPTION</th>
                <th style={{ padding: '0.75rem 1rem' }}>ORIGIN IP</th>
                <th style={{ padding: '0.75rem 1rem' }}>TIMESTAMP</th>
              </tr>
            </thead>
            <tbody>
              {activities.length > 0 ? (
                activities.map((act) => (
                  <tr key={act.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: 'rgba(99, 102, 241, 0.15)',
                        color: '#a5b4fc',
                        border: '1px solid rgba(99, 102, 241, 0.3)'
                      }}>
                        {act.type}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#fff' }}>{act.event}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{act.ip}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                      {new Date(act.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    {isLoadingData ? 'Loading activity data...' : 'No activity records found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


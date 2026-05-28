import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { login } from '../api/authApi'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Check for success messages from deletion redirect
  const infoMessage = location.state?.infoMessage || ''

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const resp = await login(username, password)
      localStorage.setItem('auth_token', resp.token)
      localStorage.setItem('auth_username', resp.username)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container" style={{ display: 'grid', placeContent: 'center', minHeight: '80vh', padding: '20px 0' }}>
      <div className="card" style={{ width: '450px', maxWidth: '100%', boxShadow: '0 25px 60px -15px rgba(0,0,0,0.8)' }}>
        <div className="cardBody" style={{ display: 'grid', gap: '16px' }}>
          {/* Logo Brand Header */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center', marginBottom: '10px' }}>
            <div
              aria-hidden="true"
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: 'linear-gradient(135deg, var(--primary), #06b6d4)',
                boxShadow: '0 0 25px rgba(20, 184, 166, 0.4)',
                display: 'grid',
                placeContent: 'center'
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#061c1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-11-7-11S5 10.7 5 15a7 7 0 0 0 7 7z"></path>
              </svg>
            </div>
            <div>
              <h2 style={{ fontSize: '24px', margin: '6px 0 0', fontWeight: 800, tracking: '-0.5px' }}>Aquaduct Portal</h2>
              <div className="muted" style={{ fontSize: '13px', fontWeight: 500, marginTop: '2px' }}>
                Secure gateway for environmental telemetry analysis.
              </div>
            </div>
          </div>

          {/* Success Info Message Banner */}
          {infoMessage && (
            <div className="glassPanel" style={{ background: 'var(--success-soft)', borderColor: 'rgba(16, 185, 129, 0.15)', padding: '12px 14px', borderRadius: '10px' }}>
              <span className="successText" style={{ fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                ✓ {infoMessage}
              </span>
            </div>
          )}

          {/* Error Message Banner */}
          {error && (
            <div className="glassPanel" style={{ background: 'var(--danger-soft)', borderColor: 'rgba(244, 63, 94, 0.15)', padding: '12px 14px', borderRadius: '10px' }}>
              <span className="dangerText" style={{ fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                ⚠️ {error}
              </span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={onSubmit} style={{ display: 'grid', gap: '14px' }}>
            <div className="field">
              <span className="fieldLabel">Operator Username</span>
              <input
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                placeholder="e.g. administrator"
                required
              />
            </div>

            <div className="field">
              <span className="fieldLabel">Access Password</span>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                required
              />
            </div>

            <button className="btn btnPrimary" type="submit" disabled={isSubmitting} style={{ marginTop: '10px' }}>
              {isSubmitting ? 'Verifying Credentials...' : 'Authenticate'}
            </button>

            <button className="btn" type="button" onClick={() => navigate('/signup')} style={{ border: 'none', background: 'transparent', fontSize: '13px', color: 'var(--primary)', fontWeight: 600, padding: 0 }}>
              Need a profile? Register node account
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createUser } from '../api/usersApi'

export default function Signup() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (password.length < 4) {
      setError('Password must be at least 4 characters long')
      return
    }

    setIsSubmitting(true)
    try {
      await createUser(username, password)
      setSuccess('Account created successfully! Loading portal access...')
      setTimeout(() => navigate('/login'), 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Username may be taken.')
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
              <h2 style={{ fontSize: '24px', margin: '6px 0 0', fontWeight: 800, tracking: '-0.5px' }}>Register Node</h2>
              <div className="muted" style={{ fontSize: '13px', fontWeight: 500, marginTop: '2px' }}>
                Join the distributed sensory monitoring network.
              </div>
            </div>
          </div>

          {/* Success Banner */}
          {success && (
            <div className="glassPanel" style={{ background: 'var(--success-soft)', borderColor: 'rgba(16, 185, 129, 0.15)', padding: '12px 14px', borderRadius: '10px' }}>
              <span className="successText" style={{ fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                ✓ {success}
              </span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="glassPanel" style={{ background: 'var(--danger-soft)', borderColor: 'rgba(244, 63, 94, 0.15)', padding: '12px 14px', borderRadius: '10px' }}>
              <span className="dangerText" style={{ fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                ⚠️ {error}
              </span>
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={onSubmit} style={{ display: 'grid', gap: '14px' }}>
            <div className="field">
              <span className="fieldLabel">Preferred Username</span>
              <input
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                placeholder="e.g. river-monitor-01"
                required
              />
            </div>

            <div className="field">
              <span className="fieldLabel">Node Security Password</span>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="Minimum 4 characters"
                required
              />
            </div>

            <button className="btn btnPrimary" type="submit" disabled={isSubmitting} style={{ marginTop: '10px' }}>
              {isSubmitting ? 'Registering Node...' : 'Register Operator'}
            </button>

            <button className="btn" type="button" onClick={() => navigate('/login')} style={{ border: 'none', background: 'transparent', fontSize: '13px', color: 'var(--primary)', fontWeight: 600, padding: 0 }}>
              Already registered? Return to Authentication
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
